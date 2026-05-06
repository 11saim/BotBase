// <!DOCTYPE html>
// <html lang="en">
// <head>
// <meta charset="UTF-8"/>
// <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
// <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
// <style>
// *{margin:0;padding:0;box-sizing:border-box}
// body{font-family:'Plus Jakarta Sans',sans-serif;background:#fff;color:#0a0a0f}

// .pricing-section{padding:80px 24px;background:#fff;max-width:1200px;margin:0 auto}

// .badge{display:inline-block;padding:8px 18px;border-radius:999px;background:#f3f4f6;color:#6b7280;font-size:13px;font-weight:600;font-family:'Syne',sans-serif;letter-spacing:.05em;margin-bottom:20px}

// .section-title{font-family:'Syne',sans-serif;font-size:clamp(32px,5vw,52px);font-weight:800;line-height:1.1;margin-bottom:16px;color:#0a0a0f}

// .section-sub{font-size:17px;color:#6b7280;max-width:520px;margin:0 auto 60px;line-height:1.6}

// .text-center{text-align:center}

// /* Rainbow gradient utility */
// .rainbow-text{background:linear-gradient(135deg,#f97316,#eab308,#22c55e,#06b6d4,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
// .rainbow-bg{background:linear-gradient(135deg,#f97316,#eab308,#22c55e,#06b6d4,#6366f1,#a855f7)}
// .rainbow-border{position:relative}
// .rainbow-border::before{content:'';position:absolute;inset:-2px;border-radius:26px;background:linear-gradient(135deg,#f97316,#eab308,#22c55e,#06b6d4,#6366f1,#a855f7);z-index:-1}

// /* Cards grid */
// .cards-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:64px}

// @media(max-width:900px){.cards-grid{grid-template-columns:repeat(2,1fr)}}
// @media(max-width:540px){.cards-grid{grid-template-columns:1fr}}

// .plan-card{border-radius:24px;padding:28px 24px;border:1.5px solid #e8eaed;background:#fafafa;position:relative;transition:transform .2s ease,box-shadow .2s ease;opacity:0;transform:translateY(24px)}
// .plan-card.visible{opacity:1;transform:translateY(0);transition:opacity .5s ease,transform .5s ease,box-shadow .2s ease}
// .plan-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.08)}

// .plan-card.popular{background:#fff;border:none;box-shadow:0 8px 32px rgba(0,0,0,.1)}
// .plan-card.popular:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.15)}

// /* Rainbow top strip */
// .card-strip{height:4px;border-radius:999px;margin-bottom:20px}
// .strip-free{background:#e8eaed}
// .strip-colored{background:linear-gradient(90deg,#f97316,#eab308,#22c55e,#06b6d4,#6366f1,#a855f7)}

// .popular-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:4px 14px;border-radius:999px;font-size:11px;font-weight:700;font-family:'Syne',sans-serif;letter-spacing:.08em;color:#fff}

// .plan-name{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;margin-bottom:4px}
// .plan-desc{font-size:13px;color:#9ca3af;margin-bottom:20px;line-height:1.5}

// .plan-price{display:flex;align-items:flex-end;gap:2px;margin-bottom:20px}
// .price-num{font-family:'Syne',sans-serif;font-size:44px;font-weight:800;line-height:1}
// .price-period{font-size:14px;color:#9ca3af;padding-bottom:6px}

// .plan-cta{display:block;width:100%;padding:11px 16px;border-radius:12px;font-size:14px;font-weight:600;text-align:center;cursor:pointer;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:all .18s ease;text-decoration:none}
// .cta-outline{background:#fff;color:#0a0a0f;border:1.5px solid #e8eaed}
// .cta-outline:hover{border-color:#0a0a0f}
// .cta-rainbow{color:#fff;border:none}

// .features-list{margin-top:20px;padding-top:20px;border-top:1px solid #f3f4f6;display:flex;flex-direction:column;gap:10px}
// .feature-item{display:flex;align-items:center;gap:10px;font-size:13px;color:#374151}
// .check-icon{width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;color:#fff}
// .check-green{background:#22c55e}
// .check-gray{background:#d1d5db}

// /* Comparison table */
// .comparison-wrap{overflow-x:auto;border-radius:20px;border:1.5px solid #e8eaed}

// .comparison-title{font-family:'Syne',sans-serif;font-size:clamp(22px,3vw,30px);font-weight:800;margin-bottom:8px}
// .comparison-sub{font-size:15px;color:#9ca3af;margin-bottom:28px}

// table{width:100%;border-collapse:collapse;min-width:600px}
// thead tr{background:#f9fafb}
// th{padding:14px 20px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#0a0a0f;text-align:center;border-bottom:1.5px solid #e8eaed}
// th:first-child{text-align:left}
// th.th-popular{position:relative}
// .th-popular-inner{position:relative;display:inline-flex;flex-direction:column;align-items:center;gap:4px}
// .th-pop-badge{font-size:10px;padding:2px 8px;border-radius:999px;color:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600}

// tbody tr{border-bottom:1px solid #f3f4f6;transition:background .15s}
// tbody tr:last-child{border-bottom:none}
// tbody tr:hover{background:#fafafa}
// td{padding:13px 20px;font-size:14px;color:#374151;text-align:center}
// td:first-child{text-align:left;font-weight:500;color:#0a0a0f}

// .cat-row td{background:#f9fafb;font-family:'Syne',sans-serif;font-size:12px;font-weight:700;letter-spacing:.06em;color:#9ca3af;padding:10px 20px}
// .cat-row td:first-child{text-align:left}

// .val-yes{color:#22c55e;font-size:16px}
// .val-no{color:#d1d5db;font-size:16px}
// .val-text{color:#374151}
// .val-rainbow{font-weight:600}

// /* animate cards on load */
// @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
// </style>
// </head>
// <body>
// <section class="pricing-section">
//   <div class="text-center">
//     <span class="badge">SIMPLE PRICING</span>
//     <h2 class="section-title">Choose a plan that <span class="rainbow-text">scales with you</span></h2>
//     <p class="section-sub">Start free and upgrade when your chatbot traffic grows. No hidden fees.</p>
//   </div>

//   <!-- Cards -->
//   <div class="cards-grid" id="cardsGrid">

//     <!-- Free -->
//     <div class="plan-card" style="transition-delay:.05s">
//       <div class="card-strip strip-free"></div>
//       <div class="plan-name">Free</div>
//       <div class="plan-desc">Perfect for trying out the platform</div>
//       <div class="plan-price">
//         <span class="price-num">$0</span>
//         <span class="price-period">/mo</span>
//       </div>
//       <a href="/register" class="plan-cta cta-outline">Get Started</a>
//       <div class="features-list">
//         <div class="feature-item"><span class="check-icon check-green">✓</span>1 bot</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>100 messages/month</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>1 file upload per bot</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Basic analytics</div>
//         <div class="feature-item"><span class="check-icon check-gray">✗</span>Lead collection</div>
//         <div class="feature-item"><span class="check-icon check-gray">✗</span>Custom Q&A</div>
//       </div>
//     </div>

//     <!-- Starter -->
//     <div class="plan-card" style="transition-delay:.12s">
//       <div class="card-strip strip-colored"></div>
//       <div class="plan-name">Starter</div>
//       <div class="plan-desc">For individuals getting started</div>
//       <div class="plan-price">
//         <span class="price-num">$9</span>
//         <span class="price-period">/mo</span>
//       </div>
//       <a href="/register" class="plan-cta cta-outline">Choose Starter</a>
//       <div class="features-list">
//         <div class="feature-item"><span class="check-icon check-green">✓</span>3 bots</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>2,000 messages/month</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>5 file uploads per bot</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Basic analytics</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Lead collection</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Custom Q&A</div>
//       </div>
//     </div>

//     <!-- Pro (popular) -->
//     <div class="plan-card popular rainbow-border" style="transition-delay:.19s">
//       <div class="card-strip strip-colored"></div>
//       <div class="popular-badge rainbow-bg">MOST POPULAR</div>
//       <div class="plan-name rainbow-text">Pro</div>
//       <div class="plan-desc">For growing products and teams</div>
//       <div class="plan-price">
//         <span class="price-num">$19</span>
//         <span class="price-period">/mo</span>
//       </div>
//       <button class="plan-cta cta-rainbow rainbow-bg">Choose Pro</button>
//       <div class="features-list">
//         <div class="feature-item"><span class="check-icon check-green">✓</span>10 bots</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>10,000 messages/month</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>20 file uploads per bot</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Full analytics</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Lead collection</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Custom Q&A</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>API access</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>3 team members</div>
//       </div>
//     </div>

//     <!-- Agency -->
//     <div class="plan-card" style="transition-delay:.26s">
//       <div class="card-strip strip-colored"></div>
//       <div class="plan-name">Agency</div>
//       <div class="plan-desc">For high-volume and client work</div>
//       <div class="plan-price">
//         <span class="price-num">$49</span>
//         <span class="price-period">/mo</span>
//       </div>
//       <a href="/register" class="plan-cta cta-outline">Choose Agency</a>
//       <div class="features-list">
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Unlimited bots</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>50,000 messages/month</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Unlimited file uploads</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Full analytics</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Lead collection</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>Custom Q&A</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>API access</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>White-label widget</div>
//         <div class="feature-item"><span class="check-icon check-green">✓</span>10 team members</div>
//       </div>
//     </div>

//   </div>

//   <!-- Comparison Table -->
//   <div class="text-center" style="margin-bottom:28px">
//     <h3 class="comparison-title">Full <span class="rainbow-text">plan comparison</span></h3>
//     <p class="comparison-sub">Everything side by side so you can pick with confidence</p>
//   </div>

//   <div class="comparison-wrap">
//     <table>
//       <thead>
//         <tr>
//           <th style="text-align:left;width:30%">Feature</th>
//           <th>Free</th>
//           <th>Starter</th>
//           <th class="th-popular">
//             <div class="th-popular-inner">
//               Pro
//               <span class="th-pop-badge rainbow-bg">Popular</span>
//             </div>
//           </th>
//           <th>Agency</th>
//         </tr>
//       </thead>
//       <tbody>
//         <!-- Limits -->
//         <tr class="cat-row"><td colspan="5">LIMITS</td></tr>
//         <tr>
//           <td>Bots</td>
//           <td class="val-text">1</td>
//           <td class="val-text">3</td>
//           <td class="val-rainbow rainbow-text">10</td>
//           <td class="val-text">Unlimited</td>
//         </tr>
//         <tr>
//           <td>Messages / month</td>
//           <td class="val-text">100</td>
//           <td class="val-text">2,000</td>
//           <td class="val-rainbow rainbow-text">10,000</td>
//           <td class="val-text">50,000</td>
//         </tr>
//         <tr>
//           <td>File uploads per bot</td>
//           <td class="val-text">1</td>
//           <td class="val-text">5</td>
//           <td class="val-rainbow rainbow-text">20</td>
//           <td class="val-text">Unlimited</td>
//         </tr>
//         <tr>
//           <td>Team members</td>
//           <td class="val-text">1</td>
//           <td class="val-text">1</td>
//           <td class="val-rainbow rainbow-text">3</td>
//           <td class="val-text">10</td>
//         </tr>

//         <!-- Features -->
//         <tr class="cat-row"><td colspan="5">FEATURES</td></tr>
//         <tr>
//           <td>Lead collection</td>
//           <td><span class="val-no">✗</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//         </tr>
//         <tr>
//           <td>Custom Q&A overrides</td>
//           <td><span class="val-no">✗</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//         </tr>
//         <tr>
//           <td>Gaps (unanswered questions)</td>
//           <td><span class="val-no">✗</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//         </tr>
//         <tr>
//           <td>Chatbot customization</td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//         </tr>
//         <tr>
//           <td>Training history</td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//         </tr>

//         <!-- Analytics -->
//         <tr class="cat-row"><td colspan="5">ANALYTICS</td></tr>
//         <tr>
//           <td>Analytics</td>
//           <td class="val-text" style="color:#9ca3af">Basic</td>
//           <td class="val-text" style="color:#9ca3af">Basic</td>
//           <td class="val-rainbow rainbow-text">Full</td>
//           <td class="val-text">Full</td>
//         </tr>

//         <!-- Advanced -->
//         <tr class="cat-row"><td colspan="5">ADVANCED</td></tr>
//         <tr>
//           <td>API access</td>
//           <td><span class="val-no">✗</span></td>
//           <td><span class="val-no">✗</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//         </tr>
//         <tr>
//           <td>White-label widget</td>
//           <td><span class="val-no">✗</span></td>
//           <td><span class="val-no">✗</span></td>
//           <td><span class="val-no">✗</span></td>
//           <td><span class="val-yes">✓</span></td>
//         </tr>
//         <tr>
//           <td>Team collaboration</td>
//           <td><span class="val-no">✗</span></td>
//           <td><span class="val-no">✗</span></td>
//           <td><span class="val-yes">✓</span></td>
//           <td><span class="val-yes">✓</span></td>
//         </tr>
//       </tbody>
//     </table>
//   </div>

// </section>

// <script>
// // Animate cards in on load
// window.addEventListener('load', () => {
//   const cards = document.querySelectorAll('.plan-card');
//   cards.forEach((card, i) => {
//     setTimeout(() => {
//       card.classList.add('visible');
//     }, 100 + i * 80);
//   });
// });

// // Animate table rows on scroll
// const observer = new IntersectionObserver((entries) => {
//   entries.forEach(entry => {
//     if(entry.isIntersecting) {
//       entry.target.style.opacity = '1';
//       entry.target.style.transform = 'translateX(0)';
//     }
//   });
// }, { threshold: 0.1 });

// document.querySelectorAll('tbody tr:not(.cat-row)').forEach((row, i) => {
//   row.style.opacity = '0';
//   row.style.transform = 'translateX(-10px)';
//   row.style.transition = `opacity .3s ease ${i * 30}ms, transform .3s ease ${i * 30}ms`;
//   observer.observe(row);
// });
// </script>
// </body>
// </html>
