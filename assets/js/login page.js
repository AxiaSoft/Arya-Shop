// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════
function renderLoginPage() {
  return `
    ${renderHeader()}
    
    <main class="max-w-md mx-auto px-4 py-16 lg:py-24">
      <div class="glass rounded-3xl p-8 animate-scale">
        ${state.loginStep === 'phone' ? `
          <!-- Phone Step -->
          <div class="text-center mb-8">
            <div class="text-7xl mb-5 animate-float">🔐</div>
            <h1 class="text-2xl font-black mb-2">ورود / ثبت‌نام</h1>
            <p class="text-white/60">شماره موبایل خود را وارد کنید</p>
          </div>
          
          <form onsubmit="event.preventDefault(); sendOtp(this.phone.value)">
            <div class="mb-6">
              <label for="login-phone" class="block text-sm text-white/70 mb-2">شماره موبایل</label>
              <input 
                type="tel" 
                id="login-phone" 
                name="phone" 
                required 
                pattern="09[0-9]{9}"
                class="w-full input-style text-center text-xl tracking-widest"
                dir="ltr"
                placeholder="09123456789"
                maxlength="11"
                autofocus
              >
            </div>
            
            <button type="submit" class="w-full btn-primary py-4 rounded-xl font-bold text-lg mb-5">
              دریافت کد تایید
            </button>
            
          </form>
        ` : `
          <!-- OTP Step -->
          <div class="text-center mb-8">
            <div class="text-7xl mb-5">📱</div>
            <h1 class="text-2xl font-black mb-2">کد تایید</h1>
            <p class="text-white/60">
              کد ارسال شده به <span class="text-violet-400 font-mono">${state.loginPhone}</span> را وارد کنید
            </p>
            <div class="mt-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl px-5 py-3">
              <p class="text-xs text-emerald-300 mb-1">🔐 کد تایید (نسخه دمو):</p>
              <p class="text-2xl font-black text-emerald-400 font-mono tracking-widest">${state.generatedOtp}</p>
            </div>
          </div>
          
          <form onsubmit="event.preventDefault(); verifyOtp(this.otp.value)">
            <div class="mb-6">
              <label for="otp-code" class="block text-sm text-white/70 mb-2 text-center">کد ۴ رقمی</label>
              <input 
                type="text" 
                id="otp-code" 
                name="otp" 
                required 
                maxlength="4"
                pattern="[0-9]{4}"
                class="w-full input-style text-center text-3xl tracking-[1.5rem] font-bold"
                dir="ltr"
                placeholder="••••"
                autofocus
              >
            </div>
            
            <button type="submit" class="w-full btn-primary py-4 rounded-xl font-bold text-lg mb-5">
              تایید و ورود
            </button>
            
            <div class="flex items-center justify-between text-sm">
              <button 
                type="button" 
                onclick="changePhoneNumber()"
                class="text-white/60 hover:text-white transition-colors flex items-center gap-1"
              >
                → تغییر شماره
              </button>
              
              <span id="otp-timer-display">
                ${state.otpTimer > 0 ? `
                  <span class="text-white/40">
                    ${Math.floor(state.otpTimer / 60)}:${String(state.otpTimer % 60).padStart(2, '0')}
                  </span>
                ` : `
                  <button 
                    type="button" 
                    onclick="resendOtp()"
                    class="text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    ارسال مجدد کد
                  </button>
                `}
              </span>
            </div>
          </form>
        `}
      </div>
    </main>
    
    ${renderFooter()}
  `;
}
