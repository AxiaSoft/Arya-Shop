// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION FUNCTIONS
// File: assets/js/authentication functions.js
// ═══════════════════════════════════════════════════════════════

// ریست وضعیت ورود
function resetLoginState() {
  if (state.otpInterval) {
    clearInterval(state.otpInterval);
    state.otpInterval = null;
  }
  state.loginStep = 'phone';
  state.loginPhone = '';
  state.generatedOtp = '';
  state.otpTimer = 0;
}

// شروع شمارش معکوس
function startOtpCountdown(seconds = 120) {
  state.otpTimer = seconds;
  if (state.otpInterval) clearInterval(state.otpInterval);
  state.otpInterval = setInterval(() => {
    state.otpTimer--;
    if (state.otpTimer <= 0) {
      clearInterval(state.otpInterval);
      state.otpInterval = null;
    }
    updateOtpTimerDisplay();
  }, 1000);
}

// ارسال کد OTP
function sendOtp(phone) {
  if (!utils.isValidPhone(phone)) {
    toast('شماره موبایل نامعتبر است', 'error');
    return;
  }

  // جلوگیری از ارسال دوباره در زمان شمارش
  if (state.loginStep === 'otp' && state.otpTimer > 0) {
    toast('لطفاً تا پایان شمارش معکوس صبر کنید', 'warning');
    return;
  }

  state.loginPhone = phone;
  state.generatedOtp = utils.generateOtp();
  state.loginStep = 'otp';
  startOtpCountdown(120);

  toast(`کد تایید برای شماره ${phone} ارسال شد`, 'info');
  render();
}

// نمایش شمارش معکوس
function updateOtpTimerDisplay() {
  const timerEl = document.getElementById('otp-timer-display');
  if (timerEl) {
    if (state.otpTimer > 0) {
      timerEl.innerHTML = `<span class="text-white/40">${Math.floor(state.otpTimer / 60)}:${String(state.otpTimer % 60).padStart(2, '0')}</span>`;
    } else {
      timerEl.innerHTML = `<button type="button" onclick="resendOtp()" class="text-violet-400 hover:text-violet-300 transition-colors">ارسال مجدد کد</button>`;
    }
  }
}

// ارسال مجدد کد
function resendOtp() {
  if (state.otpTimer > 0) return;

  state.generatedOtp = utils.generateOtp();
  startOtpCountdown(120);

  toast(`کد جدید برای شماره ${state.loginPhone} ارسال شد`, 'info');
  render();
}

// تایید کد OTP
function verifyOtp(code) {
  if (code !== state.generatedOtp) {
    toast('کد تایید اشتباه است', 'error');
    return;
  }

  if (state.otpInterval) {
    clearInterval(state.otpInterval);
    state.otpInterval = null;
  }

  if (state.loginPhone === '09123456789') {
    state.isAdmin = true;
    state.user = { phone: state.loginPhone, name: 'مدیر سیستم' };
    goTo('admin');
    toast('👋 خوش آمدید مدیر گرامی!');
  } else {
    state.user = { phone: state.loginPhone, name: 'کاربر' };
    goTo('home');
    toast('🎉 ورود موفقیت‌آمیز!');
  }

  resetLoginState();
  render(); // مهم: بعد از ورود دوباره رندر بشه
}

// تغییر شماره موبایل
function changePhoneNumber() {
  resetLoginState();
  render();
}

// خروج از حساب
function logout() {
  state.confirmModal = {
    type: 'logout',
    title: 'خروج از حساب کاربری',
    message: 'آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟',
    icon: '🚪',
    confirmText: 'خروج',
    confirmClass: 'btn-danger',
    onConfirm: () => {
      state.user = null;
      state.isAdmin = false;
      state.confirmModal = null;
      goTo('home');
      toast('از حساب خارج شدید', 'info');
      render();
    }
  };
  render();
}