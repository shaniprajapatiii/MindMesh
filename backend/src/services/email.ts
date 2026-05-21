import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const FROM = `MindMesh <${process.env.SMTP_USER}>`;

export async function sendOtpEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: FROM, to,
    subject: 'Your MindMesh Verification Code',
    html: `<div style="font-family:system-ui;max-width:480px;margin:0 auto;background:#0a0a0f;color:#f0f0f8;padding:32px;border-radius:16px;border:1px solid rgba(99,102,241,0.3)">
      <h2 style="color:#6366f1;margin:0 0 8px">MindMesh</h2>
      <p style="color:#9090a8;margin:0 0 24px;font-size:14px">Your DSA learning companion</p>
      <p style="margin:0 0 16px">Your verification code:</p>
      <div style="font-size:40px;font-weight:800;letter-spacing:10px;color:#6366f1;margin:16px 0;padding:16px;background:rgba(99,102,241,0.1);border-radius:12px;text-align:center">${otp}</div>
      <p style="color:#6b7280;font-size:13px;margin:0">Valid for 10 minutes. Don't share this code with anyone.</p>
    </div>`,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  await transporter.sendMail({
    from: FROM, to,
    subject: `Welcome to MindMesh, ${name}! 🚀`,
    html: `<div style="font-family:system-ui;max-width:480px;margin:0 auto;background:#0a0a0f;color:#f0f0f8;padding:32px;border-radius:16px">
      <h2 style="color:#6366f1">Welcome to MindMesh, ${name}! 🚀</h2>
      <p>Your DSA journey starts now. Here's what you can do:</p>
      <ul style="color:#9090a8;line-height:2">
        <li>🎯 Track problems across LeetCode, Codeforces, CodeChef & GFG</li>
        <li>🧠 Get AI-powered hints and notes</li>
        <li>🎨 Visualize data structures on canvas</li>
        <li>📊 Analyze your progress with deep analytics</li>
        <li>🏆 Compete on the leaderboard</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:16px">Start Solving →</a>
    </div>`,
  });
}

export async function sendStreakReminderEmail(to: string, name: string, streak: number) {
  await transporter.sendMail({
    from: FROM, to,
    subject: `⚠️ Don't break your ${streak}-day streak, ${name}!`,
    html: `<div style="font-family:system-ui;max-width:480px;margin:0 auto;background:#0a0a0f;color:#f0f0f8;padding:32px;border-radius:16px">
      <h2 style="color:#f59e0b">🔥 Keep your streak alive!</h2>
      <p>Hey ${name}, your <strong style="color:#f59e0b">${streak}-day streak</strong> is at risk!</p>
      <p style="color:#9090a8">Solve at least one problem today to maintain it.</p>
      <a href="${process.env.FRONTEND_URL}/problems" style="display:inline-block;background:#f59e0b;color:white;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;margin-top:16px">Solve a Problem Now →</a>
    </div>`,
  });
}

export async function sendPasswordResetEmail(to: string, otp: string) {
  await transporter.sendMail({
    from: FROM, to,
    subject: 'Reset your MindMesh password',
    html: `<div style="font-family:system-ui;max-width:480px;margin:0 auto;background:#0a0a0f;color:#f0f0f8;padding:32px;border-radius:16px">
      <h2 style="color:#6366f1">Password Reset</h2>
      <p>Use this code to reset your password:</p>
      <div style="font-size:40px;font-weight:800;letter-spacing:10px;color:#6366f1;margin:16px 0;padding:16px;background:rgba(99,102,241,0.1);border-radius:12px;text-align:center">${otp}</div>
      <p style="color:#6b7280;font-size:13px">Valid for 15 minutes. If you didn't request this, ignore this email.</p>
    </div>`,
  });
}
