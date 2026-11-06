package app.qrjoe.studio;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.provider.Settings;

import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(
    name = "CameraBackup",
    permissions = {
        @Permission(alias = "images", strings = { Manifest.permission.READ_MEDIA_IMAGES }),
        @Permission(alias = "storage", strings = { Manifest.permission.READ_EXTERNAL_STORAGE }),
        @Permission(alias = "camera", strings = { Manifest.permission.CAMERA })
    }
)
public class CameraBackupPlugin extends Plugin {

    private static final String PREFS_NAME = "qrjoe_secure";
    private static final String FALLBACK_PREFS_NAME = "qrjoe_secure_fallback";
    private static final String TOKEN_KEY = "yandex_token";
    private static final String DEFAULT_FOLDER = "disk:/IT";
    private static final String YANDEX_API = "https://cloud-api.yandex.net/v1/disk";
    private static final int TIMEOUT_MS = 25_000;

    private SharedPreferences securePreferences;

    @Override
    public void load() {
        try {
            MasterKey masterKey = new MasterKey.Builder(getContext())
                .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                .build();
            securePreferences = EncryptedSharedPreferences.create(
                getContext(),
                PREFS_NAME,
                masterKey,
                EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            );
        } catch (Exception error) {
            securePreferences = getContext().getSharedPreferences(FALLBACK_PREFS_NAME, Context.MODE_PRIVATE);
        }
    }

    private String photoAlias() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ? "images" : "storage";
    }

    private JSObject permissionResult() {
        PermissionState photos = getPermissionState(photoAlias());
        PermissionState camera = getPermissionState("camera");
        JSObject result = new JSObject();
        result.put("photos", photos == null ? "unavailable" : photos.toString());
        result.put("camera", camera == null ? "unavailable" : camera.toString());
        result.put("files", "system-picker");
        return result;
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        call.resolve(permissionResult());
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        requestPermissionForAliases(new String[] { photoAlias(), "camera" }, call, "permissionsCallback");
    }

    @PermissionCallback
    private void permissionsCallback(PluginCall call) {
        call.resolve(permissionResult());
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            call.reject("Could not open app settings.");
        }
    }

    @PluginMethod
    public void isOnline(PluginCall call) {
        JSObject result = new JSObject();
        result.put("online", isNetworkAvailable());
        call.resolve(result);
    }

    @PluginMethod
    public void saveToken(PluginCall call) {
        String token = call.getString("token", "").trim();
        if (token.isEmpty()) {
            call.reject("The Yandex Disk token is empty.");
            return;
        }
        securePreferences.edit().putString(TOKEN_KEY, token).apply();
        call.resolve();
    }

    @PluginMethod
    public void hasToken(PluginCall call) {
        JSObject result = new JSObject();
        result.put("saved", getToken() != null);
        call.resolve(result);
    }

    @PluginMethod
    public void clearToken(PluginCall call) {
        securePreferences.edit().remove(TOKEN_KEY).apply();
        call.resolve();
    }

    @PluginMethod
    public void testConnection(PluginCall call) {
        String token = getToken();
        if (token == null) {
            call.reject("Add a Yandex Disk token first.");
            return;
        }
        new Thread(() -> {
            JSObject result = new JSObject();
            try {
                JSONObject response = httpGetJson(YANDEX_API, token);
                JSONObject user = response.optJSONObject("user");
                String name = user == null ? null : user.optString("login", null);
                if (name == null && user != null) name = user.optString("display_name", null);
                result.put("ok", true);
                if (name != null) result.put("user", name);
                call.resolve(result);
            } catch (Exception error) {
                result.put("ok", false);
                result.put("message", readableError(error, "Could not reach Yandex Disk."));
                call.resolve(result);
            }
        }).start();
    }

    @PluginMethod
    public void listCameraPhotos(PluginCall call) {
        if (getPermissionState(photoAlias()) != PermissionState.GRANTED) {
            call.reject("Photo permission has not been granted.");
            return;
        }
        int limit = call.getInt("limit", 500);
        try {
            List<JSObject> photos = new ArrayList<>();
            for (CameraPhoto photo : queryCameraPhotos(limit)) {
                photos.add(photo.toJson());
            }
            JSObject result = new JSObject();
            result.put("photos", new JSArray(photos));
            call.resolve(result);
        } catch (Exception error) {
            call.reject(readableError(error, "Could not read camera photos."));
        }
    }

    @PluginMethod
    public void uploadCameraPhotos(PluginCall call) {
        if (getPermissionState(photoAlias()) != PermissionState.GRANTED) {
            call.reject("Photo permission has not been granted.");
            return;
        }
        if (!isNetworkAvailable()) {
            call.reject("No internet connection. Backup was not started.");
            return;
        }
        String token = getToken();
        if (token == null) {
            call.reject("Add a Yandex Disk token in backup settings first.");
            return;
        }
        String folder = call.getString("folder", DEFAULT_FOLDER);
        if (folder == null || folder.trim().isEmpty()) folder = DEFAULT_FOLDER;

        List<CameraPhoto> photos;
        try {
            photos = queryCameraPhotos(0);
        } catch (Exception error) {
            call.reject(readableError(error, "Could not read camera photos."));
            return;
        }

        List<CameraPhoto> pending = new ArrayList<>();
        for (CameraPhoto photo : photos) {
            if (!photo.uploaded) pending.add(photo);
        }

        if (pending.isEmpty()) {
            JSObject result = new JSObject();
            result.put("total", 0);
            result.put("uploaded", 0);
            result.put("failed", 0);
            call.resolve(result);
            return;
        }

        final String targetFolder = folder.trim();
        final String authToken = token;
        new Thread(() -> {
            int uploaded = 0;
            int failed = 0;
            int total = pending.size();
            try {
                ensureFolder(authToken, targetFolder);
            } catch (Exception error) {
                call.reject(readableError(error, "Could not prepare the Yandex Disk folder."));
                return;
            }

            for (int index = 0; index < total; index++) {
                CameraPhoto photo = pending.get(index);
                int current = index + 1;
                notifyProgress(photo, current, total, "uploading", null);
                try {
                    uploadPhoto(authToken, targetFolder, photo);
                    securePreferences
                        .edit()
                        .putBoolean(uploadKey(photo.id, photo.dateTaken), true)
                        .apply();
                    uploaded++;
                    notifyProgress(photo, current, total, "uploaded", null);
                } catch (Exception error) {
                    failed++;
                    notifyProgress(photo, current, total, "failed", readableError(error, "Upload failed."));
                }
            }

            JSObject result = new JSObject();
            result.put("total", total);
            result.put("uploaded", uploaded);
            result.put("failed", failed);
            call.resolve(result);
        }).start();
    }

    private String getToken() {
        String token = securePreferences.getString(TOKEN_KEY, null);
        if (token == null || token.trim().isEmpty()) return null;
        return token.trim();
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager manager = (ConnectivityManager) getContext().getSystemService(Context.CONNECTIVITY_SERVICE);
        if (manager == null) return false;
        Network network = manager.getActiveNetwork();
        if (network == null) return false;
        NetworkCapabilities capabilities = manager.getNetworkCapabilities(network);
        return capabilities != null && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET);
    }

    private String uploadKey(String id, long dateTaken) {
        return "uploaded_" + id + "_" + dateTaken;
    }

    private List<CameraPhoto> queryCameraPhotos(int limit) {
        ContentResolver resolver = getContext().getContentResolver();
        Uri collection = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        boolean modern = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q;

        List<String> projection = new ArrayList<>();
        projection.add(MediaStore.Images.Media._ID);
        projection.add(MediaStore.Images.Media.DISPLAY_NAME);
        projection.add(MediaStore.Images.Media.DATE_TAKEN);
        projection.add(MediaStore.Images.Media.DATE_ADDED);
        projection.add(MediaStore.Images.Media.SIZE);
        projection.add(MediaStore.Images.Media.MIME_TYPE);
        projection.add(modern ? MediaStore.Images.Media.RELATIVE_PATH : MediaStore.Images.Media.DATA);

        String selection = modern
            ? MediaStore.Images.Media.RELATIVE_PATH + " LIKE ?"
            : MediaStore.Images.Media.DATA + " LIKE ?";
        String[] selectionArgs = modern ? new String[] { "DCIM/Camera%" } : new String[] { "%/DCIM/Camera/%" };
        String sortOrder = MediaStore.Images.Media.DATE_TAKEN + " DESC";

        List<CameraPhoto> photos = new ArrayList<>();
        try (Cursor cursor = resolver.query(collection, projection.toArray(new String[0]), selection, selectionArgs, sortOrder)) {
            if (cursor == null) return photos;
            int idIndex = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID);
            int nameIndex = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME);
            int dateTakenIndex = cursor.getColumnIndex(MediaStore.Images.Media.DATE_TAKEN);
            int dateAddedIndex = cursor.getColumnIndex(MediaStore.Images.Media.DATE_ADDED);
            int sizeIndex = cursor.getColumnIndex(MediaStore.Images.Media.SIZE);
            int mimeIndex = cursor.getColumnIndex(MediaStore.Images.Media.MIME_TYPE);

            while (cursor.moveToNext()) {
                long id = cursor.getLong(idIndex);
                String name = cursor.getString(nameIndex);
                if (name == null || name.isEmpty()) name = "photo_" + id + ".jpg";
                long dateTaken = dateTakenIndex >= 0 ? cursor.getLong(dateTakenIndex) : 0L;
                if (dateTaken <= 0 && dateAddedIndex >= 0) dateTaken = cursor.getLong(dateAddedIndex) * 1000L;
                long size = sizeIndex >= 0 ? cursor.getLong(sizeIndex) : 0L;
                String mime = mimeIndex >= 0 ? cursor.getString(mimeIndex) : "image/jpeg";
                if (mime == null) mime = "image/jpeg";
                boolean uploaded = securePreferences.getBoolean(uploadKey(String.valueOf(id), dateTaken), false);
                photos.add(
                    new CameraPhoto(
                        String.valueOf(id),
                        name,
                        ContentUris.withAppendedId(collection, id),
                        size,
                        dateTaken,
                        mime,
                        uploaded
                    )
                );
                if (limit > 0 && photos.size() >= limit) break;
            }
        }
        return photos;
    }

    private void uploadPhoto(String token, String folder, CameraPhoto photo) throws IOException {
        String safeName = safeFileName(photo.name, photo.id);
        String remotePath = folder.endsWith("/") ? folder + safeName : folder + "/" + safeName;
        String metaUrl = YANDEX_API + "/resources/upload?overwrite=true&path=" +
            URLEncoder.encode(remotePath, StandardCharsets.UTF_8.name());
        JSONObject meta = httpGetJson(metaUrl, token);
        String href = meta.optString("href", null);
        if (href == null || href.isEmpty()) throw new IOException("Yandex Disk did not return an upload URL.");
        String method = meta.optString("method", "PUT");

        byte[] bytes = readBytes(photo.uri);
        HttpURLConnection connection = (HttpURLConnection) new URL(href).openConnection();
        connection.setRequestMethod(method);
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", photo.mimeType);
        connection.setFixedLengthStreamingMode(bytes.length);
        try (OutputStream output = connection.getOutputStream()) {
            output.write(bytes);
        }
        int code = connection.getResponseCode();
        if (code < 200 || code >= 300) {
            throw new IOException("Yandex upload failed with HTTP " + code + ".");
        }
        connection.disconnect();
    }

    private void ensureFolder(String token, String folder) throws IOException {
        String url = YANDEX_API + "/resources?path=" + URLEncoder.encode(folder, StandardCharsets.UTF_8.name());
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod("PUT");
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        connection.setRequestProperty("Authorization", "OAuth " + token);
        int code = connection.getResponseCode();
        connection.disconnect();
        if (code == 201 || code == 200 || code == 409) return;
        if (code == 401 || code == 403) throw new IOException("Yandex Disk rejected the token.");
        throw new IOException("Could not prepare Yandex Disk folder (HTTP " + code + ").");
    }

    private JSONObject httpGetJson(String url, String token) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(TIMEOUT_MS);
        connection.setReadTimeout(TIMEOUT_MS);
        connection.setRequestProperty("Authorization", "OAuth " + token);
        connection.setRequestProperty("Accept", "application/json");
        int code = connection.getResponseCode();
        InputStream stream = code >= 400 ? connection.getErrorStream() : connection.getInputStream();
        String body = stream == null ? "" : readText(stream);
        connection.disconnect();
        if (code < 200 || code >= 300) {
            if (code == 401 || code == 403) throw new IOException("Yandex Disk rejected the token.");
            throw new IOException("Yandex Disk request failed with HTTP " + code + ".");
        }
        try {
            return new JSONObject(body);
        } catch (Exception error) {
            throw new IOException("Yandex Disk returned an unreadable response.");
        }
    }

    private byte[] readBytes(Uri uri) throws IOException {
        InputStream input = getContext().getContentResolver().openInputStream(uri);
        if (input == null) throw new IOException("Could not open the photo.");
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] buffer = new byte[64 * 1024];
            int read;
            while ((read = input.read(buffer)) != -1) {
                output.write(buffer, 0, read);
            }
            return output.toByteArray();
        } finally {
            input.close();
        }
    }

    private String readText(InputStream input) throws IOException {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] buffer = new byte[8 * 1024];
            int read;
            while ((read = input.read(buffer)) != -1) output.write(buffer, 0, read);
            return output.toString(StandardCharsets.UTF_8.name());
        } finally {
            input.close();
        }
    }

    private void notifyProgress(CameraPhoto photo, int current, int total, String status, String message) {
        JSObject event = new JSObject();
        event.put("id", photo.id);
        event.put("current", current);
        event.put("total", total);
        event.put("fileName", photo.name);
        event.put("status", status);
        if (message != null) event.put("message", message);
        notifyListeners("uploadProgress", event);
    }

    private String safeFileName(String name, String id) {
        String safe = name.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
        if (safe.isEmpty()) safe = "photo_" + id + ".jpg";
        return safe;
    }

    private String readableError(Exception error, String fallback) {
        String message = error.getMessage();
        return message == null || message.isEmpty() ? fallback : message;
    }

    private static class CameraPhoto {

        final String id;
        final String name;
        final Uri uri;
        final long size;
        final long dateTaken;
        final String mimeType;
        final boolean uploaded;

        CameraPhoto(String id, String name, Uri uri, long size, long dateTaken, String mimeType, boolean uploaded) {
            this.id = id;
            this.name = name;
            this.uri = uri;
            this.size = size;
            this.dateTaken = dateTaken;
            this.mimeType = mimeType;
            this.uploaded = uploaded;
        }

        JSObject toJson() {
            JSObject object = new JSObject();
            object.put("id", id);
            object.put("name", name);
            object.put("uri", uri.toString());
            object.put("size", size);
            object.put("dateTaken", dateTaken);
            object.put("mimeType", mimeType);
            object.put("uploaded", uploaded);
            return object;
        }
    }
}
