package com.summifysocial.app

import android.app.Activity
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle

/**
 * Invisible, transient activity that briefly acquires window focus
 * to bypass Android 10+ (API 29+) background clipboard access restrictions.
 * Reads the system clipboard, delivers the text to the callback, and immediately finishes.
 */
class ClipboardCaptureActivity : Activity() {

    companion object {
        private var pendingCallback: ((String) -> Unit)? = null

        fun capture(context: Context, callback: (String) -> Unit) {
            pendingCallback = callback
            val intent = Intent(context, ClipboardCaptureActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION)
            }
            context.startActivity(intent)
        }
    }

    private var hasProcessed = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        overridePendingTransition(0, 0)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            readClipboardAndFinish()
        }
    }

    override fun onResume() {
        super.onResume()
        readClipboardAndFinish()
    }

    private fun readClipboardAndFinish() {
        if (hasProcessed) return
        hasProcessed = true

        val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager
        val clip = try {
            clipboard?.primaryClip
        } catch (e: Exception) {
            null
        }

        val text = if (clip != null && clip.itemCount > 0) {
            clip.getItemAt(0)?.text?.toString() ?: ""
        } else {
            ""
        }

        val cb = pendingCallback
        pendingCallback = null
        cb?.invoke(text)

        finish()
        overridePendingTransition(0, 0)
    }

    override fun finish() {
        super.finish()
        overridePendingTransition(0, 0)
    }
}
