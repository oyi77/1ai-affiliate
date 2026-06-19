# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: attribution-dashboard.spec.js >> renders analytics metrics, chart, and anomaly alerts
- Location: tests/playwright/attribution-dashboard.spec.js:3:1

# Error details

```
Error: browser.newContext: Target page, context or browser has been closed
Browser logs:

<launching> /home/openclaw/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/tmp/playwright_chromiumdev_profile-vVE3D7 --remote-debugging-pipe --no-startup-window
<launched> pid=2757259
[pid=2757259][err] [0618/205803.126043:FATAL:gin/v8_initializer.cc:654] Error loading V8 startup snapshot file
[pid=2757259][err] [0618/205803.128073:FATAL:gin/v8_initializer.cc:654] Error loading V8 startup snapshot file
[pid=2757259][err] [0618/205803.473586:ERROR:content/browser/gpu/gpu_process_host.cc:999] GPU process launch failed: error_code=1002
[pid=2757259][err] [0618/205803.473642:WARNING:content/browser/gpu/gpu_process_host.cc:1447] The GPU process has crashed 1 time(s)
[pid=2757259][err] [0618/205803.479008:ERROR:content/browser/gpu/gpu_process_host.cc:999] GPU process launch failed: error_code=1002
[pid=2757259][err] [0618/205803.479715:FATAL:gin/v8_initializer.cc:654] Error loading V8 startup snapshot file
[pid=2757259][err] [0618/205803.480264:WARNING:content/browser/gpu/gpu_process_host.cc:1447] The GPU process has crashed 2 time(s)
[pid=2757259][err] [0618/205803.482462:ERROR:content/browser/gpu/gpu_process_host.cc:999] GPU process launch failed: error_code=1002
[pid=2757259][err] [0618/205803.482485:WARNING:content/browser/gpu/gpu_process_host.cc:1447] The GPU process has crashed 3 time(s)
[pid=2757259][err] [0618/205803.483824:ERROR:content/browser/gpu/gpu_process_host.cc:999] GPU process launch failed: error_code=1002
[pid=2757259][err] [0618/205803.483848:WARNING:content/browser/gpu/gpu_process_host.cc:1447] The GPU process has crashed 4 time(s)
[pid=2757259][err] [0618/205803.484934:ERROR:content/browser/gpu/gpu_process_host.cc:999] GPU process launch failed: error_code=1002
[pid=2757259][err] [0618/205803.485138:WARNING:content/browser/gpu/gpu_process_host.cc:1447] The GPU process has crashed 5 time(s)
[pid=2757259][err] [0618/205803.488857:ERROR:content/browser/gpu/gpu_process_host.cc:999] GPU process launch failed: error_code=1002
[pid=2757259][err] [0618/205803.488876:WARNING:content/browser/gpu/gpu_process_host.cc:1447] The GPU process has crashed 6 time(s)
[pid=2757259][err] [0618/205803.488890:FATAL:content/browser/gpu/gpu_data_manager_impl_private.cc:418] GPU process isn't usable. Goodbye.
```