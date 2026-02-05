// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE (GPT‑5 FINAL)
// - OTP 6 digits
// - CAPTCHA حرفه‌ای (Canvas + Noise + Distortion)
// - Admin detection (09123456789)
// - Stable timer
// - حفظ لاگین بعد از رفرش فقط وقتی واقعاً لاگین است
// - Sync با AppState (بدون دیتابیس)
// ═══════════════════════════════════════════════════════════════

(function () {
  // ───────── Initial State ─────────
  state.loginStep    = state.loginStep    || "phone";
  state.loginPhone   = state.loginPhone   || "";
  state.generatedOtp = state.generatedOtp || null;
  state.otpTimer     = state.otpTimer     || 0;
  state.otpInterval  = state.otpInterval  || null;
  state.captchaText  = state.captchaText  || "";

  // ───────── Restore from AppState فقط اگر loggedIn = true ─────────
  const persisted = (window.AppState ? AppState.get() : {}) || {};

  if (persisted.loggedIn === true && persisted.currentUser) {
    state.currentUser = persisted.currentUser;
    state.user        = persisted.user;
    state.isAdmin     = persisted.isAdmin || false;
  } else {
    state.currentUser = state.currentUser || null;
    state.user        = state.user || null;
    state.isAdmin     = typeof state.isAdmin === "boolean" ? state.isAdmin : false;
  }

  // ═══════════════════════════════════════════════════════════════
  // CAPTCHA (centered with measureText)
  // ═══════════════════════════════════════════════════════════════
  function generateCaptcha() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let text = "";
    for (let i = 0; i < 5; i++) text += chars[Math.floor(Math.random() * chars.length)];
    state.captchaText = text;

    const canvas = document.getElementById("captcha-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, w, h);

    // Noise
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random()})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }

    // Lines
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.5})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }

    // Text centered
    ctx.font = "28px Arial Black";
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";

    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    let x = (w - textWidth) / 2;
    const y = h / 2;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const chWidth = ctx.measureText(ch).width;
      const angle = Math.random() * 0.4 - 0.2;

      ctx.save();
      ctx.translate(x + chWidth / 2, y);
      ctx.rotate(angle);
      ctx.fillText(ch, -chWidth / 2, 0);
      ctx.restore();

      x += chWidth + 2;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TIMER
  // ═══════════════════════════════════════════════════════════════
  function clearOtpInterval() {
    if (state.otpInterval) {
      clearInterval(state.otpInterval);
      state.otpInterval = null;
    }
  }

  function updateOtpTimerDom() {
    const el = document.getElementById("otp-timer-display");
    if (!el) return;

    if (state.otpTimer > 0) {
      const m = Math.floor(state.otpTimer / 60);
      const s = String(state.otpTimer % 60).padStart(2, "0");
      el.innerHTML = `<span class="text-white/40">${m}:${s}</span>`;
    } else {
      el.innerHTML = `
        <button onclick="resendOtp()" class="text-violet-400 hover:text-violet-300">
          ارسال مجدد کد
        </button>
      `;
    }
  }

  function startOtpTimer(seconds) {
    state.otpTimer = seconds;
    updateOtpTimerDom();

    clearOtpInterval();
    state.otpInterval = setInterval(() => {
      if (state.otpTimer <= 0) {
        clearOtpInterval();
        state.otpTimer = 0;
        updateOtpTimerDom();
        return;
      }
      state.otpTimer -= 1;
      updateOtpTimerDom();
    }, 1000);
  }

  // ═══════════════════════════════════════════════════════════════
  // SEND OTP
  // ═══════════════════════════════════════════════════════════════
  function sendOtp(phone) {
    const p = String(phone || "").trim();
    const enteredCaptcha = String(document.getElementById("captcha-input")?.value || "")
      .trim()
      .toUpperCase();

    if (enteredCaptcha !== state.captchaText) {
      toast("کد کپچا اشتباه است", "danger");
      generateCaptcha();
      return;
    }

    if (!/^09\d{9}$/.test(p)) {
      toast("شماره موبایل نامعتبر است", "warning");
      return;
    }

    state.loginPhone = p;
    state.generatedOtp = String(Math.floor(100000 + Math.random() * 900000));

    state.loginStep = "otp";
    render();
    startOtpTimer(120);

    toast("کد تایید ارسال شد", "success");
  }

  // ═══════════════════════════════════════════════════════════════
  // RESEND OTP
  // ═══════════════════════════════════════════════════════════════
  function resendOtp() {
    state.generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
    startOtpTimer(120);
    toast("کد جدید ارسال شد", "success");
  }

  // ═══════════════════════════════════════════════════════════════
  // CHANGE PHONE
  // ═══════════════════════════════════════════════════════════════
  function changePhoneNumber() {
    clearOtpInterval();
    state.loginStep = "phone";
    state.generatedOtp = null;
    state.otpTimer = 0;
    render();
  }

  // ═══════════════════════════════════════════════════════════════
  // VERIFY OTP + SAVE LOGIN
  // ═══════════════════════════════════════════════════════════════
  function verifyOtp(code) {
    const entered = String(code || "").trim();
    const realOtp = String(state.generatedOtp || "").trim();

    if (!realOtp) {
      toast("کد منقضی شده است، دوباره درخواست دهید", "warning");
      return;
    }

    if (entered !== realOtp) {
      toast("کد وارد شده اشتباه است", "danger");
      return;
    }

    const userObj = {
      id: "user_" + (window.utils?.generateId?.() || Date.now()),
      name: "کاربر",
      phone: state.loginPhone
    };

    state.currentUser = { ...userObj };
    state.user = {
      ...userObj,
      addresses: state.user?.addresses || [],
      avatar: state.user?.avatar || "",
      nationalId: state.user?.nationalId || ""
    };

    state.isAdmin = state.currentUser.phone === "09123456789";

    if (window.AppState) {
      AppState.set({
        loggedIn: true,
        currentUser: state.currentUser,
        user: state.user,
        isAdmin: state.isAdmin
      });
    }

    toast("با موفقیت وارد شدید", "success");

    clearOtpInterval();
    state.generatedOtp = null;
    state.otpTimer = 0;
    state.loginStep = "phone";

    if (state.isAdmin) goTo("admin");
    else goTo("profile");

    render();
  }

  // ═══════════════════════════════════════════════════════════════
  // RAW RENDER FUNCTION
  // ═══════════════════════════════════════════════════════════════
  function _renderLoginPageInner() {
    return `
      ${typeof renderHeader === "function" ? renderHeader() : ""}

      <main class="max-w-md mx-auto px-4 py-16 lg:py-24">
        <div class="glass rounded-3xl p-8 animate-scale">

          ${
            state.loginStep === "phone"
              ? `
            <!-- PHONE STEP -->
            <div class="text-center mb-8">
              <div class="text-7xl mb-5 animate-float">🔐</div>
              <h1 class="text-2xl font-black mb-2">ورود / ثبت‌نام</h1>
              <p class="text-white/60">شماره موبایل خود را وارد کنید</p>
            </div>

            <form onsubmit="event.preventDefault(); sendOtp(this.phone.value)">

              <div class="mb-6">
                <label class="block text-sm text-white/70 mb-2">شماره موبایل</label>
                <input 
                  type="tel"
                  name="phone"
                  class="input-style w-full text-center text-xl tracking-widest"
                  maxlength="11"
                  placeholder="09123456789"
                  dir="ltr"
                  required
                >
              </div>

              <!-- CAPTCHA -->
              <div class="mb-6 text-center">
                <label class="block text-sm text-white/70 mb-2">کپچا</label>

                <div class="flex items-center justify-center gap-3">
                  <canvas id="captcha-canvas" width="150" height="50" class="rounded-lg border border-white/20"></canvas>

                  <button 
                    type="button"
                    onclick="generateCaptcha()"
                    class="btn-ghost px-3 py-2 rounded-lg"
                  >
                    🔄
                  </button>
                </div>

                <input 
                  id="captcha-input"
                  class="input-style w-full mt-3 text-center tracking-widest uppercase"
                  placeholder="کد امنیتی"
                  maxlength="5"
                  oninput="this.value = this.value.toUpperCase()"
                >
              </div>

              <button class="btn-primary w-full py-4 rounded-xl font-bold text-lg">
                دریافت کد تایید
              </button>

            </form>
          `
              : `
            <!-- OTP STEP -->
            <div class="text-center mb-8">
              <div class="text-7xl mb-5">📱</div>
              <h1 class="text-2xl font-black mb-2">کد تایید</h1>
              <p class="text-white/60">کد ارسال شده به ${state.loginPhone}</p>

              <div class="mt-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl px-5 py-3">
                <p class="text-xs text-emerald-300 mb-1">کد تایید (نسخه دمو):</p>
                <p class="text-2xl font-black text-emerald-400 font-mono tracking-widest">${state.generatedOtp}</p>
              </div>
            </div>

            <form onsubmit="event.preventDefault(); verifyOtp(this.otp.value)">
              <input 
                type="text"
                name="otp"
                maxlength="6"
                pattern="[0-9]{6}"
                class="input-style w-full text-center text-3xl tracking-[1.2rem] font-bold"
                placeholder="••••••"
                dir="ltr"
                required
              >

              <button class="btn-primary w-full py-4 mt-6 rounded-xl font-bold text-lg">
                تایید و ورود
              </button>

              <div class="flex items-center justify-between mt-4 text-sm">
                <button onclick="changePhoneNumber()" class="text-white/60" type="button">تغییر شماره</button>
                <span id="otp-timer-display"></span>
              </div>
            </form>
          `
          }

        </div>
      </main>

      ${typeof renderFooter === "function" ? renderFooter() : ""}
    `;
  }

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC RENDER (CAPTCHA + TIMER INIT)
// ═══════════════════════════════════════════════════════════════
  window.renderLoginPage = function () {
    const html = _renderLoginPageInner();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (state.loginStep === "phone") {
          generateCaptcha();
        } else {
          updateOtpTimerDom();
        }
      });
    });

    return html;
  };

  // Expose
  window.sendOtp = sendOtp;
  window.verifyOtp = verifyOtp;
  window.resendOtp = resendOtp;
  window.changePhoneNumber = changePhoneNumber;
  window.generateCaptcha = generateCaptcha;

})();