package com.summifysocial.app

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.ClipboardManager
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.HapticFeedbackConstants
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.view.animation.DecelerateInterpolator
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat
import org.json.JSONObject

/**
 * FloatingBubbleService — provides a draggable floating bubble overlay
 * matching the Bypass project's style (44dp footprint, 40dp circular card,
 * edge docking, and automatic 40% dimming + bezel tucking when idle).
 *
 * Tapping or copying a social media link opens the SummifySocial quick verification overlay.
 */
class FloatingBubbleService : Service() {

    companion object {
        private const val CHANNEL_ID = "floating_channel"
        private const val NOTIFICATION_ID = 1001

        // Production URL — points to Vercel-hosted web app
        private const val BASE_URL = "https://summifysocial.vercel.app/floating"

        // Idle delay before tucking & dimming down (matching Bypass 2.5s)
        private const val IDLE_DELAY_MS = 2500L

        // Patterns to detect social media URLs in clipboard
        private val SOCIAL_DOMAINS = listOf(
            "x.com", "twitter.com",
            "facebook.com", "fb.com", "fb.watch",
            "tiktok.com",
            "youtube.com", "youtu.be",
            "reddit.com",
            "instagram.com",
            "threads.net"
        )
    }

    private lateinit var windowManager: WindowManager
    private var bubbleRoot: View? = null
    private var expandedView: View? = null
    private var webView: WebView? = null
    private var clipboardManager: ClipboardManager? = null
    private var clipListener: ClipboardManager.OnPrimaryClipChangedListener? = null
    private var isExpanded = false
    private var lastClipText: String? = null

    // Edge docking & idle dimming (Bypass style)
    private val idleHandler = Handler(Looper.getMainLooper())
    private val idleRunnable = Runnable { dimAndTuckBubble() }
    private var isDimmed = false
    private var isDockedOnLeft = false
    private var tuckAnimator: ValueAnimator? = null
    private var lastBubbleX = 0
    private var lastBubbleY = 0

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        clipboardManager = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager

        createNotificationChannel()
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIFICATION_ID, buildNotification(), ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, buildNotification(), 0)
        } else {
            startForeground(NOTIFICATION_ID, buildNotification())
        }

        createBubbleView()
        registerClipboardListener()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        idleHandler.removeCallbacksAndMessages(null)
        tuckAnimator?.cancel()
        unregisterClipboardListener()
        removeBubbleView()
        removeExpandedView()
    }

    // ────────────────────── Notification Channel ──────────────────────

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "SummifySocial Floating Assistant",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps the floating verification bubble active"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SummifySocial Active")
            .setContentText("Floating verifier is ready — copy any social post link")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun getOverlayType(): Int {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }
    }

    // ────────────────────── Bubble View (Bypass Style) ──────────────────────

    @SuppressLint("ClickableViewAccessibility")
    private fun createBubbleView() {
        if (bubbleRoot != null) return

        val inflater = LayoutInflater.from(this)
        val view = inflater.inflate(R.layout.view_floating_bubble, null)

        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val screenHeight = displayMetrics.heightPixels
        val bubbleSize = (44 * displayMetrics.density).toInt()
        val edgeMargin = (8 * displayMetrics.density).toInt()

        // Dock flush against the right edge initially (or 0 for left)
        val initialX = screenWidth - bubbleSize
        val initialY = (screenHeight * 0.35f).toInt()

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            getOverlayType(),
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = initialX
            y = initialY
        }

        lastBubbleX = params.x
        lastBubbleY = params.y
        isDockedOnLeft = false
        isDimmed = false

        var touchStartX = 0
        var touchStartY = 0
        var initialTouchRawX = 0f
        var initialTouchRawY = 0f
        var isDragging = false

        view.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    cancelIdleTimer()
                    tuckAnimator?.cancel()
                    touchStartX = params.x
                    touchStartY = params.y
                    initialTouchRawX = event.rawX
                    initialTouchRawY = event.rawY
                    isDragging = false

                    // Immediate visual response: wake to full opacity
                    view.alpha = 1.0f
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = (event.rawX - initialTouchRawX).toInt()
                    val dy = (event.rawY - initialTouchRawY).toInt()
                    if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
                        isDragging = true
                        isDimmed = false
                    }
                    if (isDragging) {
                        params.x = (touchStartX + dx).coerceIn(0, screenWidth - bubbleSize)
                        params.y = (touchStartY + dy).coerceIn(
                            edgeMargin,
                            screenHeight - bubbleSize - (24 * displayMetrics.density).toInt()
                        )
                        lastBubbleX = params.x
                        lastBubbleY = params.y
                        try {
                            windowManager.updateViewLayout(view, params)
                        } catch (e: Exception) {}
                    }
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (isDragging) {
                        // Snap flush to whichever edge is closer (0 on left, screenWidth - bubbleSize on right)
                        isDockedOnLeft = (params.x + bubbleSize / 2 < screenWidth / 2)
                        val targetX = if (isDockedOnLeft) 0 else (screenWidth - bubbleSize)

                        tuckAnimator?.cancel()
                        tuckAnimator = ValueAnimator.ofInt(params.x, targetX).apply {
                            duration = 220
                            interpolator = DecelerateInterpolator(1.5f)
                            addUpdateListener { va ->
                                params.x = va.animatedValue as Int
                                lastBubbleX = params.x
                                try {
                                    windowManager.updateViewLayout(view, params)
                                } catch (e: Exception) {}
                            }
                            addListener(object : AnimatorListenerAdapter() {
                                override fun onAnimationEnd(animation: Animator) {
                                    scheduleIdleTimer()
                                }
                            })
                            start()
                        }
                    } else {
                        view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                        // If tucked/dimmed, wake up & pop out smoothly, grab clipboard and expand verification panel
                        wakeAndUntuckBubble {
                            ClipboardCaptureActivity.capture(this@FloatingBubbleService) { captured ->
                                val trimmed = captured.trim()
                                val urlCandidate = if (trimmed.isNotBlank() && (isSocialMediaUrl(trimmed) || trimmed.startsWith("http://") || trimmed.startsWith("https://"))) {
                                    trimmed
                                } else {
                                    null
                                }
                                expandPanel(urlCandidate)
                            }
                        }
                    }
                    true
                }
                else -> false
            }
        }

        try {
            windowManager.addView(view, params)
            bubbleRoot = view
            scheduleIdleTimer()
        } catch (e: Exception) {}
    }

    private fun removeBubbleView() {
        cancelIdleTimer()
        tuckAnimator?.cancel()
        bubbleRoot?.let {
            try { windowManager.removeView(it) } catch (e: Exception) {}
        }
        bubbleRoot = null
    }

    // ────────────────────── Idle Dimming & Edge Tucking ──────────────────────

    private fun scheduleIdleTimer() {
        idleHandler.removeCallbacks(idleRunnable)
        if (!isExpanded) {
            idleHandler.postDelayed(idleRunnable, IDLE_DELAY_MS)
        }
    }

    private fun cancelIdleTimer() {
        idleHandler.removeCallbacks(idleRunnable)
    }

    /**
     * Animates the bubble to hide ~48% of its body behind the screen bezel
     * and dims its opacity down to 0.4 when idle (matching Bypass style).
     */
    private fun dimAndTuckBubble() {
        if (isExpanded || isDimmed || bubbleRoot == null) return
        val view = bubbleRoot ?: return
        val params = view.layoutParams as? WindowManager.LayoutParams ?: return

        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val bubbleSize = (44 * displayMetrics.density).toInt()
        val tuckDistance = (bubbleSize * 0.48f).toInt()

        val startX = params.x
        val targetX = if (isDockedOnLeft) {
            -tuckDistance
        } else {
            screenWidth - bubbleSize + tuckDistance
        }

        val startAlpha = view.alpha
        val targetAlpha = 0.4f

        tuckAnimator?.cancel()
        tuckAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 320
            interpolator = DecelerateInterpolator(1.5f)
            addUpdateListener { va ->
                val fraction = va.animatedFraction
                params.x = (startX + (targetX - startX) * fraction).toInt()
                lastBubbleX = params.x
                view.alpha = startAlpha + (targetAlpha - startAlpha) * fraction
                try {
                    windowManager.updateViewLayout(view, params)
                } catch (e: Exception) {}
            }
            addListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                    isDimmed = true
                }
            })
            start()
        }
    }

    /**
     * Smoothly restores full opacity (1.0) and slides the bubble back out flush from the bezel.
     */
    private fun wakeAndUntuckBubble(onEnd: (() -> Unit)? = null) {
        cancelIdleTimer()
        val view = bubbleRoot ?: return
        val params = view.layoutParams as? WindowManager.LayoutParams ?: return

        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val bubbleSize = (44 * displayMetrics.density).toInt()
        val restX = if (isDockedOnLeft) 0 else (screenWidth - bubbleSize)

        tuckAnimator?.cancel()

        if (!isDimmed && params.x == restX && view.alpha >= 0.98f) {
            onEnd?.invoke()
            return
        }

        val startX = params.x
        val startAlpha = view.alpha

        tuckAnimator = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = 180
            interpolator = DecelerateInterpolator(1.5f)
            addUpdateListener { va ->
                val fraction = va.animatedFraction
                params.x = (startX + (restX - startX) * fraction).toInt()
                lastBubbleX = params.x
                view.alpha = startAlpha + (1.0f - startAlpha) * fraction
                try {
                    windowManager.updateViewLayout(view, params)
                } catch (e: Exception) {}
            }
            addListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) {
                    isDimmed = false
                    params.x = restX
                    lastBubbleX = restX
                    view.alpha = 1.0f
                    try {
                        windowManager.updateViewLayout(view, params)
                    } catch (e: Exception) {}
                    onEnd?.invoke()
                }
            })
            start()
        }
    }

    // ────────────────────── Expanded Verification Panel ──────────────────────

    @SuppressLint("SetJavaScriptEnabled")
    private fun expandPanel(urlToVerify: String? = null) {
        cancelIdleTimer()
        if (isExpanded) {
            // If already open and a new URL was captured, navigate directly
            urlToVerify?.let { loadVerifyUrl(it) }
            return
        }

        // Hide the bubble while panel is active
        bubbleRoot?.visibility = View.GONE

        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val screenHeight = displayMetrics.heightPixels

        val panelWidth = (screenWidth * 0.94f).toInt().coerceAtMost(dpToPx(420))
        val panelHeight = (screenHeight * 0.60f).toInt().coerceAtMost(dpToPx(520))

        val backgroundDrawable = android.graphics.drawable.GradientDrawable().apply {
            setColor(0xFF0A0F1D.toInt())
            cornerRadius = dpToPx(16).toFloat()
            setStroke(dpToPx(1), 0xFF1E293B.toInt())
        }

        val rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = backgroundDrawable
            elevation = 16f
            clipToOutline = true
            setOnTouchListener { _, event ->
                if (event.action == MotionEvent.ACTION_OUTSIDE) {
                    collapsePanel()
                    true
                } else {
                    false
                }
            }
        }

        // Verification WebView (fills entire card; header with close/minimize is rendered within the web app)
        val wv = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                loadWithOverviewMode = true
                useWideViewPort = true
                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }
            setBackgroundColor(0xFF0A0F1D.toInt())

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val loadUrl = request?.url?.toString() ?: return false
                    if (!loadUrl.contains("10.0.2.2") && !loadUrl.contains("summifysocial")) {
                        val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(loadUrl)).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        }
                        startActivity(browserIntent)
                        return true
                    }
                    return false
                }
            }
            webChromeClient = WebChromeClient()
            addJavascriptInterface(AndroidBridge(this), "AndroidBridge")

            val targetUrl = if (urlToVerify != null) {
                "$BASE_URL?url=${Uri.encode(urlToVerify)}"
            } else {
                BASE_URL
            }
            loadUrl(targetUrl)
        }
        webView = wv

        rootLayout.addView(wv, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ))

        val params = WindowManager.LayoutParams(
            panelWidth,
            panelHeight,
            getOverlayType(),
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                    WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
            y = dpToPx(36)
            softInputMode = WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE or
                    WindowManager.LayoutParams.SOFT_INPUT_STATE_UNCHANGED
        }

        expandedView = rootLayout
        try {
            windowManager.addView(rootLayout, params)
            isExpanded = true
        } catch (e: Exception) {}
    }

    private fun collapsePanel() {
        removeExpandedView()
        bubbleRoot?.visibility = View.VISIBLE
        isExpanded = false
        // Resume idle timer so the bubble tucks and dims after 2.5s
        scheduleIdleTimer()
    }

    private fun removeExpandedView() {
        expandedView?.let {
            try { windowManager.removeView(it) } catch (e: Exception) {}
        }
        webView?.destroy()
        webView = null
        expandedView = null
    }

    private fun loadVerifyUrl(socialUrl: String) {
        webView?.loadUrl("$BASE_URL?url=${Uri.encode(socialUrl)}")
    }

    // ────────────────────── Clipboard Monitor ──────────────────────

    private fun registerClipboardListener() {
        clipListener = ClipboardManager.OnPrimaryClipChangedListener {
            val clip = clipboardManager?.primaryClip ?: return@OnPrimaryClipChangedListener
            if (clip.itemCount == 0) return@OnPrimaryClipChangedListener

            val text = clip.getItemAt(0).text?.toString() ?: return@OnPrimaryClipChangedListener

            if (text == lastClipText) return@OnPrimaryClipChangedListener
            lastClipText = text

            if (isSocialMediaUrl(text)) {
                wakeAndUntuckBubble {
                    expandPanel(text.trim())
                }
            }
        }
        clipboardManager?.addPrimaryClipChangedListener(clipListener)
    }

    private fun unregisterClipboardListener() {
        clipListener?.let { clipboardManager?.removePrimaryClipChangedListener(it) }
        clipListener = null
    }

    private fun isSocialMediaUrl(text: String): Boolean {
        val trimmed = text.trim().lowercase()
        if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) return false
        return SOCIAL_DOMAINS.any { domain -> trimmed.contains(domain) }
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }

    // ────────────────────── Native Bridge for WebView ──────────────────────
    inner class AndroidBridge(private val wv: WebView) {
        private val mainHandler = Handler(Looper.getMainLooper())

        @JavascriptInterface
        fun getClipboardText(): String {
            return try {
                val clip = clipboardManager?.primaryClip
                if (clip != null && clip.itemCount > 0) {
                    clip.getItemAt(0)?.text?.toString() ?: ""
                } else ""
            } catch (e: Exception) {
                ""
            }
        }

        @JavascriptInterface
        fun requestClipboardPaste() {
            mainHandler.post {
                ClipboardCaptureActivity.capture(this@FloatingBubbleService) { text ->
                    if (text.isNotBlank()) {
                        val quoted = JSONObject.quote(text)
                        wv.evaluateJavascript("if (window.onNativeClipboardCaptured) window.onNativeClipboardCaptured($quoted);", null)
                    }
                }
            }
        }

        @JavascriptInterface
        fun closePanel() {
            mainHandler.post {
                collapsePanel()
            }
        }
    }
}
