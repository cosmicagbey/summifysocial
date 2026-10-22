package com.summifysocial.app

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat

class MainActivity : ComponentActivity() {

  private var webView: WebView? = null

  // Production URL — points to Vercel-hosted web app
  private val appUrl = "https://summifysocial.vercel.app"

  companion object {
    private const val OVERLAY_PERMISSION_REQUEST_CODE = 1234
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Request overlay permission for the floating bubble
    requestOverlayPermission()

    onBackPressedDispatcher.addCallback(
      this,
      object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
          if (webView?.canGoBack() == true) {
            webView?.goBack()
          } else {
            finish()
          }
        }
      }
    )

    setContent {
      SummifyApp(
        url = appUrl,
        onWebViewCreated = { webView = it }
      )
    }
  }

  /**
   * Checks if overlay permission is granted. If yes, starts the floating service.
   * If not, launches the system settings screen to request it.
   */
  private fun requestOverlayPermission() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      if (Settings.canDrawOverlays(this)) {
        startFloatingService()
      } else {
        val intent = Intent(
          Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          Uri.parse("package:$packageName")
        )
        @Suppress("DEPRECATION")
        startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE)
      }
    } else {
      // Pre-Marshmallow: overlay permission not needed
      startFloatingService()
    }
  }

  @Deprecated("Deprecated in Java")
  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    @Suppress("DEPRECATION")
    super.onActivityResult(requestCode, resultCode, data)
    if (requestCode == OVERLAY_PERMISSION_REQUEST_CODE) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && Settings.canDrawOverlays(this)) {
        startFloatingService()
      }
    }
  }

  /**
   * Starts the FloatingBubbleService as a foreground service.
   */
  private fun startFloatingService() {
    val serviceIntent = Intent(this, FloatingBubbleService::class.java)
    ContextCompat.startForegroundService(this, serviceIntent)
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun SummifyApp(
  url: String,
  onWebViewCreated: (WebView) -> Unit
) {
  var progress by remember { mutableFloatStateOf(0f) }
  var isLoading by remember { mutableStateOf(true) }

  Box(
    modifier = Modifier
      .fillMaxSize()
      .background(Color(0xFF0A0F1D))
  ) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .statusBarsPadding()
    ) {
      if (isLoading && progress < 1f) {
        LinearProgressIndicator(
          progress = { progress },
          modifier = Modifier
            .fillMaxWidth()
            .height(2.dp),
          color = Color(0xFF3B82F6),
          trackColor = Color(0xFF1E293B)
        )
      }

      AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
          WebView(context).apply {
            settings.apply {
              javaScriptEnabled = true
              domStorageEnabled = true
              databaseEnabled = true
              loadWithOverviewMode = true
              useWideViewPort = true
              cacheMode = WebSettings.LOAD_DEFAULT
              allowFileAccess = true
              mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }

            setBackgroundColor(android.graphics.Color.parseColor("#0A0F1D"))

            webViewClient = object : WebViewClient() {
              override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                isLoading = true
              }

              override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                isLoading = false
              }

              override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
              ) {
                super.onReceivedError(view, request, error)
              }
            }

            webChromeClient = object : WebChromeClient() {
              override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progress = newProgress / 100f
              }
            }

            loadUrl(url)
            onWebViewCreated(this)
          }
        }
      )
    }
  }
}
