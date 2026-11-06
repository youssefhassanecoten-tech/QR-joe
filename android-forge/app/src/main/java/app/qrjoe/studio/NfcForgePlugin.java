package app.qrjoe.studio;

import android.content.Intent;
import android.nfc.NdefMessage;
import android.nfc.NdefRecord;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.Ndef;
import android.nfc.tech.NdefFormatable;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@CapacitorPlugin(name = "NfcForge")
public class NfcForgePlugin extends Plugin implements NfcAdapter.ReaderCallback {

    private NfcAdapter adapter;
    private PluginCall pendingCall;
    private NdefMessage pendingMessage;
    private String operation = "read";
    private final Handler handler = new Handler(Looper.getMainLooper());

    private final Runnable timeout = () -> {
        if (pendingCall != null) {
            PluginCall call = pendingCall;
            finish();
            call.reject("No NFC tag was detected. Hold the tag to the back of the phone and try again.");
        }
    };

    @Override
    public void load() {
        adapter = NfcAdapter.getDefaultAdapter(getContext());
    }

    @PluginMethod
    public void status(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", adapter != null);
        result.put("enabled", adapter != null && adapter.isEnabled());
        call.resolve(result);
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_NFC_SETTINGS);
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            call.reject("Could not open NFC settings.");
        }
    }

    @PluginMethod
    public void writeTag(PluginCall call) {
        String url = call.getString("url", "").trim();
        String vcard = call.getString("vcard", "").trim();
        String primary = call.getString("primary", "online");
        if (url.isEmpty() && vcard.isEmpty()) {
            call.reject("Add an online URL, an offline vCard, or both.");
            return;
        }

        List<NdefRecord> records = new ArrayList<>();
        NdefRecord online = url.isEmpty() ? null : NdefRecord.createUri(url);
        NdefRecord offline = vcard.isEmpty()
            ? null
            : NdefRecord.createMime("text/vcard", vcard.getBytes(StandardCharsets.UTF_8));

        if ("offline".equals(primary)) {
            if (offline != null) records.add(offline);
            if (online != null) records.add(online);
        } else {
            if (online != null) records.add(online);
            if (offline != null) records.add(offline);
        }

        if (!begin(call, "write")) return;
        pendingMessage = new NdefMessage(records.toArray(new NdefRecord[0]));
        startReader();
    }

    @PluginMethod
    public void readTag(PluginCall call) {
        if (!begin(call, "read")) return;
        startReader();
    }

    @PluginMethod
    public void formatTag(PluginCall call) {
        if (!begin(call, "format")) return;
        startReader();
    }

    @PluginMethod
    public void lockTag(PluginCall call) {
        if (!begin(call, "lock")) return;
        startReader();
    }

    @PluginMethod
    public void infoTag(PluginCall call) {
        if (!begin(call, "info")) return;
        startReader();
    }

    @PluginMethod
    public void cancel(PluginCall call) {
        if (pendingCall != null) {
            PluginCall pending = pendingCall;
            finish();
            pending.reject("NFC operation cancelled.");
        }
        call.resolve();
    }

    private boolean begin(PluginCall call, String op) {
        if (adapter == null) {
            call.reject("NFC is not available on this device.");
            return false;
        }
        if (!adapter.isEnabled()) {
            call.reject("NFC is disabled. Turn it on first.");
            return false;
        }
        if (pendingCall != null) {
            call.reject("An NFC operation is already running.");
            return false;
        }
        pendingCall = call;
        pendingMessage = null;
        operation = op;
        return true;
    }

    private void startReader() {
        Bundle options = new Bundle();
        options.putInt(NfcAdapter.EXTRA_READER_PRESENCE_CHECK_DELAY, 250);
        int flags = NfcAdapter.FLAG_READER_NFC_A
            | NfcAdapter.FLAG_READER_NFC_B
            | NfcAdapter.FLAG_READER_NFC_F
            | NfcAdapter.FLAG_READER_NFC_V;
        getActivity().runOnUiThread(() -> {
            if (adapter != null) {
                adapter.enableReaderMode(getActivity(), this, flags, options);
            }
        });
        handler.removeCallbacks(timeout);
        handler.postDelayed(timeout, 60_000);
        JSObject event = new JSObject();
        event.put("state", "waiting");
        event.put("operation", operation);
        notifyListeners("state", event);
    }

    @Override
    public void onTagDiscovered(Tag tag) {
        if (pendingCall == null) return;
        switch (operation) {
            case "write":
                writeToTag(tag);
                break;
            case "format":
                formatTagOnTouch(tag);
                break;
            case "lock":
                lockTagOnTouch(tag);
                break;
            case "info":
                readInfoFromTag(tag);
                break;
            default:
                readFromTag(tag);
                break;
        }
    }

    private void writeToTag(Tag tag) {
        PluginCall call = pendingCall;
        NdefMessage message = pendingMessage;
        new Thread(() -> {
            try {
                Ndef ndef = Ndef.get(tag);
                if (ndef == null) throw new Exception("This tag is not NDEF-formatted.");
                if (!ndef.isWritable()) throw new Exception("This tag is read-only.");
                int size = message.toByteArray().length;
                int maxSize = ndef.getMaxSize();
                if (size > maxSize) {
                    throw new Exception("Payload is " + size + " bytes but this tag holds " + maxSize + " bytes.");
                }
                ndef.connect();
                ndef.writeNdefMessage(message);
                ndef.close();
                JSObject result = describe(tag);
                result.put("bytes", size);
                result.put("maxSize", maxSize);
                result.put("records", message.getRecords().length);
                finish();
                call.resolve(result);
            } catch (Exception error) {
                finish();
                call.reject(error.getMessage() == null ? "NFC write failed." : error.getMessage());
            }
        }).start();
    }

    private void formatTagOnTouch(Tag tag) {
        PluginCall call = pendingCall;
        new Thread(() -> {
            try {
                Ndef ndef = Ndef.get(tag);
                JSObject result = describe(tag);
                if (ndef != null) {
                    if (!ndef.isWritable()) throw new Exception("This tag is read-only and cannot be wiped.");
                    int maxSize = ndef.getMaxSize();
                    ndef.connect();
                    ndef.writeNdefMessage(emptyMessage());
                    ndef.close();
                    result.put("path", "ndef");
                    result.put("maxSize", maxSize);
                } else {
                    NdefFormatable formattable = NdefFormatable.get(tag);
                    if (formattable == null) {
                        throw new Exception("This tag does not support NDEF formatting.");
                    }
                    formattable.connect();
                    formattable.format(null);
                    formattable.close();
                    result.put("path", "formatable");
                    result.put("maxSize", 0);
                }
                result.put("formatted", true);
                finish();
                call.resolve(result);
            } catch (Exception error) {
                finish();
                call.reject(error.getMessage() == null ? "Format failed." : error.getMessage());
            }
        }).start();
    }

    private void lockTagOnTouch(Tag tag) {
        PluginCall call = pendingCall;
        new Thread(() -> {
            try {
                Ndef ndef = Ndef.get(tag);
                if (ndef == null) throw new Exception("This tag is not NDEF-formatted.");
                ndef.connect();
                int maxSize = ndef.getMaxSize();
                ndef.makeReadOnly();
                boolean locked = !ndef.isWritable();
                ndef.close();
                if (!locked) throw new Exception("The tag refused the read-only lock.");
                JSObject result = describe(tag);
                result.put("writable", false);
                result.put("maxSize", maxSize);
                result.put("locked", true);
                finish();
                call.resolve(result);
            } catch (Exception error) {
                finish();
                call.reject(error.getMessage() == null ? "Lock failed." : error.getMessage());
            }
        }).start();
    }

    private void readInfoFromTag(Tag tag) {
        PluginCall call = pendingCall;
        new Thread(() -> {
            try {
                Ndef ndef = Ndef.get(tag);
                JSObject result = describe(tag);
                result.put("formatted", ndef != null);
                if (ndef != null) {
                    ndef.connect();
                    result.put("maxSize", ndef.getMaxSize());
                    result.put("writable", ndef.isWritable());
                    NdefMessage message = ndef.getNdefMessage();
                    result.put("records", message == null ? 0 : message.getRecords().length);
                    ndef.close();
                } else {
                    result.put("maxSize", 0);
                    result.put("writable", false);
                    result.put("records", 0);
                }
                finish();
                call.resolve(result);
            } catch (Exception error) {
                finish();
                call.reject(error.getMessage() == null ? "Tag info failed." : error.getMessage());
            }
        }).start();
    }

    private void readFromTag(Tag tag) {
        PluginCall call = pendingCall;
        new Thread(() -> {
            try {
                Ndef ndef = Ndef.get(tag);
                if (ndef == null) throw new Exception("This tag is not NDEF-formatted.");
                ndef.connect();
                NdefMessage message = ndef.getNdefMessage();
                int maxSize = ndef.getMaxSize();
                boolean writable = ndef.isWritable();
                ndef.close();

                JSArray records = new JSArray();
                if (message != null) {
                    for (NdefRecord record : message.getRecords()) {
                        JSObject item = new JSObject();
                        item.put("tnf", record.getTnf());
                        item.put("type", new String(record.getType(), StandardCharsets.UTF_8));
                        String mime = record.toMimeType();
                        if (mime != null) item.put("mime", mime);
                        item.put("value", recordValue(record));
                        records.put(item);
                    }
                }
                JSObject result = describe(tag);
                result.put("records", records);
                result.put("maxSize", maxSize);
                result.put("writable", writable);
                finish();
                call.resolve(result);
            } catch (Exception error) {
                finish();
                call.reject(error.getMessage() == null ? "NFC read failed." : error.getMessage());
            }
        }).start();
    }

    private NdefMessage emptyMessage() {
        return new NdefMessage(
            new NdefRecord[] { new NdefRecord(NdefRecord.TNF_EMPTY, new byte[0], new byte[0], new byte[0]) }
        );
    }

    private JSObject describe(Tag tag) {
        JSObject result = new JSObject();
        byte[] id = tag.getId();
        if (id != null) {
            result.put("uid", toHex(id));
            result.put("uidBytes", id.length);
        } else {
            result.put("uid", "");
            result.put("uidBytes", 0);
        }
        JSArray techs = new JSArray();
        String[] list = tag.getTechList();
        if (list != null) {
            for (String tech : list) techs.put(tech);
        }
        result.put("techs", techs);
        return result;
    }

    private String toHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            builder.append(String.format("%02X", value));
        }
        return builder.toString();
    }

    private String recordValue(NdefRecord record) {
        try {
            if (record.toUri() != null) return record.toUri().toString();
        } catch (Exception ignored) {
        }
        String mime = record.toMimeType();
        byte[] payload = record.getPayload();
        if (mime != null) return new String(payload, StandardCharsets.UTF_8);
        if (record.getTnf() == NdefRecord.TNF_WELL_KNOWN && Arrays.equals(record.getType(), NdefRecord.RTD_TEXT)) {
            if (payload.length > 0) {
                int languageLength = payload[0] & 0x3F;
                int start = 1 + languageLength;
                if (start < payload.length) {
                    return new String(payload, start, payload.length - start, StandardCharsets.UTF_8);
                }
            }
        }
        return Base64.encodeToString(payload, Base64.NO_WRAP);
    }

    private void finish() {
        handler.removeCallbacks(timeout);
        pendingCall = null;
        pendingMessage = null;
        operation = "read";
        getActivity().runOnUiThread(() -> {
            if (adapter != null) adapter.disableReaderMode(getActivity());
        });
        JSObject event = new JSObject();
        event.put("state", "idle");
        notifyListeners("state", event);
    }
}
