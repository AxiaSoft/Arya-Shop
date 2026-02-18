// ═══════════════════════════════════════════════════════════════
// DATA SDK HANDLER
// File: assets/js/data sdk handler.js
// ═══════════════════════════════════════════════════════════════
const dataHandler = {
  onDataChanged(data) {
    // Parse and sort products
    state.products = data
      .filter(d => d.type === 'product')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Parse and sort orders
    state.orders = data
      .filter(d => d.type === 'order')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Parse and sort tickets
    state.tickets = data
      .filter(d => d.type === 'ticket')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Parse categories from backend
    const backendCategories = data.filter(d => d.type === 'category');
    state.categories = backendCategories.length ? backendCategories : state.categories;

    render();
  }
};

// CRUD OPERATIONS - TICKETS
async function createTicket({ subject, message }) {
  if (!state.user) { toast('ابتدا وارد شوید', 'warning'); return false; }
  const ticket = {
    type: 'ticket',
    id: utils.generateId(),
    user_phone: state.user.phone,
    user_name: state.user.name,
    subject,
    status: 'open',
    messages: JSON.stringify([{ from: 'user', text: message, at: new Date().toISOString() }]),
    created_at: new Date().toISOString()
  };
  if (window.dataSdk) {
    const res = await window.dataSdk.create(ticket);
    if (res.isOk) { toast('تیکت ثبت شد'); return true; }
  }
  toast('خطا در ثبت تیکت', 'error'); return false;
}

async function addTicketMessage(ticket, { from, text }) {
  if (!window.dataSdk || !ticket.__backendId) return false;
  const msgs = JSON.parse(ticket.messages || '[]');
  msgs.push({ from, text, at: new Date().toISOString() });
  const res = await window.dataSdk.update({ ...ticket, messages: JSON.stringify(msgs) });
  if (res.isOk) { toast('پیام ارسال شد'); return true; }
  toast('خطا در ارسال پیام', 'error'); return false;
}

async function closeTicket(ticket) {
  if (!window.dataSdk || !ticket.__backendId) return false;
  const res = await window.dataSdk.update({ ...ticket, status: 'closed' });
  if (res.isOk) { toast('تیکت بسته شد'); return true; }
  toast('خطا در بستن تیکت', 'error'); return false;
}

// AI DEMO REPLY
function generateAiReply(userText) {
  return `🔧 راهنمایی هوشمند: برای "${userText}" تنظیمات را بررسی کنید و در صورت نیاز با پشتیبانی تماس بگیرید.`;
}