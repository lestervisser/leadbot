(function () {
    class Leadbot {
      static init(config) {
        this.config = config || {};
        this.render();
      }
  
      static render() {
        // CSS
        const style = document.createElement("style");
        style.textContent = `
          #leadbot-launcher {
            position: fixed; bottom: 20px; right: 20px;
            width: 60px; height: 60px; border-radius: 50%;
            background: #16a34a; color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-size: 28px; cursor: pointer; z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.18);
            transition: box-shadow 0.2s;
          }
          #leadbot-launcher:active {
            box-shadow: 0 2px 6px rgba(0,0,0,0.13);
          }
          #leadbot-chat {
            position: fixed; bottom: 90px; right: 20px;
            width: 340px; max-height: 70vh; background: #f6f6f6;
            border-radius: 18px; box-shadow: 0 8px 32px rgba(0,0,0,0.23);
            font-family: 'Segoe UI', 'Roboto', sans-serif; z-index: 999999;
            display: none; flex-direction: column;
            overflow: hidden;
            animation: leadbot-fade-in 0.33s cubic-bezier(0.4, 0.2, 0.2, 1);
          }
          @keyframes leadbot-fade-in {
            from { opacity: 0; transform: translateY(40px) scale(0.97);}
            to { opacity: 1; transform: translateY(0) scale(1);}
          }
          @keyframes leadbot-fade-out {
            from { opacity: 1; transform: translateY(0) scale(1);}
            to { opacity: 0; transform: translateY(40px) scale(0.97);}
          }
          #leadbot-chat header {
            padding: 14px 16px; border-bottom: 1px solid #e0e0e0;
            font-weight: bold; display: flex; align-items: center;
            background: #16a34a; color: #fff;
          }
          #leadbot-chat header img {
            border-radius: 50%; width: 36px; height: 36px; margin-right: 12px;
            border: 2px solid #fff;
          }
          #leadbot-chat .content {
            padding: 16px 12px 12px 12px;
            flex: 1 1 auto;
            overflow-y: auto;
            background: #ece5dd;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          /* Chat bubbles */
          .leadbot-bubble {
            max-width: 80%;
            padding: 10px 14px;
            margin-bottom: 2px;
            border-radius: 15px;
            font-size: 15px;
            line-height: 1.45;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            opacity: 0;
            transform: translateY(20px) scale(0.98);
            animation: leadbot-bubble-in 0.33s cubic-bezier(0.4, 0.2, 0.2, 1) forwards;
          }
          @keyframes leadbot-bubble-in {
            from { opacity: 0; transform: translateY(20px) scale(0.98);}
            to { opacity: 1; transform: translateY(0) scale(1);}
          }
          .leadbot-bubble.bot {
            background: #fff;
            color: #222;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
          }
          .leadbot-bubble.user {
            background: #dcf8c6;
            color: #222;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
          }
          /* WhatsApp style input row */
          .leadbot-wa-row {
            display: flex; align-items: center; gap: 8px;
            margin-top: 6px;
            padding: 6px 0 0 0;
          }
          .leadbot-wa-input {
            flex: 1 1 auto;
            border-radius: 18px;
            border: 1px solid #cfcfcf;
            padding: 8px 12px;
            font-size: 15px;
            background: #fff;
            outline: none;
          }
          .leadbot-wa-send {
            background: #25d366;
            border: none;
            color: #fff;
            border-radius: 50%;
            width: 40px; height: 40px;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(37,211,102,0.19);
            transition: background 0.2s;
          }
          .leadbot-wa-send:active {
            background: #1ebe5d;
          }
          /* Choice buttons in chat */
          .leadbot-choice-btn {
            background: #fff;
            color: #222;
            border-radius: 8px;
            border: 1px solid #ddd;
            padding: 8px 14px;
            margin: 2px 0;
            font-size: 15px;
            cursor: pointer;
            transition: background 0.13s;
            width: fit-content;
            align-self: flex-start;
          }
          .leadbot-choice-btn.primary {
            background: #16a34a; color: #fff; border: none;
          }
          .leadbot-choice-btn:active {
            background: #f3f3f3;
          }
          /* Form styling in bubble */
          .leadbot-form-bubble form input, .leadbot-form-bubble form textarea {
            width: 100%; margin: 5px 0; padding: 8px;
            border-radius: 6px; border: 1px solid #ccc;
            font-size: 15px;
          }
          .leadbot-form-bubble form button {
            margin: 8px 0 0 0;
            padding: 10px;
            border-radius: 8px; border: none;
            background: #16a34a; color: #fff;
            font-size: 15px; cursor: pointer; width: 100%;
          }
          /* Hide default scrollbars for chat */
          #leadbot-chat .content::-webkit-scrollbar { width: 0; background: transparent;}
        `;
        document.head.appendChild(style);
  
        // Launcher
        const launcher = document.createElement("div");
        launcher.id = "leadbot-launcher";
        launcher.innerText = "💬";
        document.body.appendChild(launcher);
  
        // Chat
        const chat = document.createElement("div");
        chat.id = "leadbot-chat";
        chat.innerHTML = `
          <header>
            <img src="https://via.placeholder.com/32" alt="avatar" />
            <div>
              Maurits<br/><small>Van Klompenburg Hekwerk</small>
            </div>
            <span id="leadbot-close" style="margin-left:auto;cursor:pointer;font-size:20px;opacity:.8;" title="Sluiten">&times;</span>
          </header>
          <div class="content" id="leadbot-content"></div>
        `;
        document.body.appendChild(chat);

        // State for chat thread
        this._messages = [];
        this._chatEl = chat;
        this._contentEl = chat.querySelector("#leadbot-content");

        // Launcher toggle with animation
        let chatOpen = false;
        launcher.addEventListener("click", () => {
          if (!chatOpen) {
            chat.style.display = "flex";
            chat.style.animation = "leadbot-fade-in 0.33s cubic-bezier(0.4, 0.2, 0.2, 1)";
            setTimeout(() => chat.style.animation = "", 350);
            chatOpen = true;
          } else {
            chat.style.animation = "leadbot-fade-out 0.25s cubic-bezier(0.4, 0.2, 0.2, 1)";
            setTimeout(() => {
              chat.style.display = "none";
              chat.style.animation = "";
              chatOpen = false;
            }, 240);
          }
        });
        chat.querySelector("#leadbot-close").onclick = () => {
          chat.style.animation = "leadbot-fade-out 0.25s cubic-bezier(0.4, 0.2, 0.2, 1)";
          setTimeout(() => {
            chat.style.display = "none";
            chat.style.animation = "";
            chatOpen = false;
          }, 240);
        };

        // Start conversation
        this._showWelcome();
      }
  
      // Add a chat bubble to the thread and scroll to bottom
      static _addBubble(opts) {
        // opts: {text, from: "bot"|"user", html, extraEl}
        const bubble = document.createElement("div");
        bubble.className = "leadbot-bubble " + (opts.from || "bot");
        if (opts.html) bubble.innerHTML = opts.html;
        else bubble.textContent = opts.text || "";
        if (opts.extraEl) bubble.appendChild(opts.extraEl);
        if (opts.class) bubble.classList.add(opts.class);
        this._contentEl.appendChild(bubble);
        // Animate in (animation is in CSS)
        setTimeout(() => {
          bubble.style.opacity = "1";
          bubble.style.transform = "translateY(0) scale(1)";
        }, 10);
        // Scroll to bottom
        this._contentEl.scrollTop = this._contentEl.scrollHeight;
        return bubble;
      }

      static _addChoices(choices) {
        // choices: [{label, action, primary, url}]
        const btns = [];
        choices.forEach((ch) => {
          const btn = document.createElement("button");
          btn.className = "leadbot-choice-btn" + (ch.primary ? " primary" : "");
          btn.textContent = ch.label;
          btn.onclick = () => {
            // User bubble
            this._addBubble({text: ch.label, from: "user"});
            // Remove all choice buttons
            btns.forEach(b=>b.parentElement && b.parentElement.removeChild(b));
            // Action
            if (ch.action) ch.action();
            if (ch.url) {
              window.open(ch.url, "_blank");
              this.sendEvent("link_click", { url: ch.url });
            }
          };
          btns.push(btn);
          // Place in new bubble
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.appendChild(btn);
          wrap.style.gap = "8px";
          this._contentEl.appendChild(wrap);
        });
        this._contentEl.scrollTop = this._contentEl.scrollHeight;
      }

      static _showWelcome() {
        this._contentEl.innerHTML = "";
        setTimeout(() => {
          this._addBubble({html: "Goedemiddag 👋<br/>Kan ik u ergens mee helpen?", from: "bot"});
          setTimeout(() => {
            this._addChoices([
              {label: "Offerte aanvragen", action: ()=>this.showForm(), primary: true},
              {label: "Afspraak maken", url: "https://voorbeeld.nl/afspraak"},
              {label: "Ik heb een vraag", action: ()=>this.showChannels()},
              {label: "Zelf uw hekwerk of poort samenstellen", action: ()=>this.showLinkCard()}
            ]);
          }, 600);
        }, 250);
      }

      static showForm() {
        // Show as a form in a bot bubble in the thread
        const formWrap = document.createElement("div");
        formWrap.className = "leadbot-form-bubble";
        formWrap.innerHTML = `
          <form id="leadbot-form" autocomplete="off">
            <div style="font-weight:500;margin-bottom:7px;">Offerte aanvragen</div>
            <input name="name" placeholder="Naam" required />
            <input type="email" name="email" placeholder="E-mail" required />
            <input name="phone" placeholder="Telefoon" />
            <textarea name="message" placeholder="Toelichting"></textarea>
            <button type="submit">Versturen</button>
          </form>
        `;
        this._addBubble({from: "bot", extraEl: formWrap});
        const form = formWrap.querySelector("#leadbot-form");
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.target).entries());
          this.sendEvent("form_submit", data);
          this._addBubble({text: "Bedankt, uw aanvraag is verstuurd!", from: "bot"});
        });
      }
  
      static showChannels() {
        this._addBubble({text: "Via welk kanaal wil je contact?", from: "bot"});
        setTimeout(() => {
          this._addChoices([
            {label: "WhatsApp", action: ()=>this.showWhatsApp(), primary: true},
            {label: "Bel me terug", action: ()=>{this._addBubble({text:"We bellen je zo snel mogelijk terug!", from:"bot"});}},
            {label: "E-mail", action: ()=>{this._addBubble({text:"Stuur gerust een e-mail naar info@voorbeeld.nl", from:"bot"});}},
            {label: "Telefoon", action: ()=>{this._addBubble({text:"Bel ons op 0612345678", from:"bot"});}},
          ]);
        }, 300);
      }
  
      static showWhatsApp() {
        // WhatsApp style card as chat bubble
        this._addBubble({text: "Typ een bericht om contact op te nemen via WhatsApp.", from: "bot"});
        // WhatsApp input row as a new bubble
        const waRow = document.createElement("div");
        waRow.className = "leadbot-wa-row";
        waRow.innerHTML = `
          <input class="leadbot-wa-input" id="wa-message" placeholder="Uw bericht..." autocomplete="off" />
          <button class="leadbot-wa-send" id="wa-send" title="Verstuur"><span style="font-size:20px;">&#x27A4;</span></button>
        `;
        const bubble = this._addBubble({from:"bot", extraEl: waRow, class:"leadbot-wa-bubble"});
        const input = waRow.querySelector("#wa-message");
        const sendBtn = waRow.querySelector("#wa-send");
        sendBtn.onclick = () => {
          const msg = input.value.trim();
          if (!msg) return input.focus();
          // Show user message as WhatsApp bubble
          this._addBubble({text: msg, from: "user"});
          const url = "https://wa.me/31612345678?text=" + encodeURIComponent(msg);
          this.sendEvent("whatsapp_start", { message: msg });
          setTimeout(() => {
            this._addBubble({text: "Klik hieronder om WhatsApp te openen.", from: "bot"});
            this._addChoices([{label:"Open WhatsApp", url, primary:true}]);
          }, 450);
        };
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") { e.preventDefault(); sendBtn.click(); }
        });
        setTimeout(()=>input.focus(), 300);
      }
  
      static showLinkCard() {
        // Show as bot bubble/card in thread
        const wrap = document.createElement("div");
        wrap.innerHTML = `
          <div style="font-weight:500;">Poort & Hekwerk Configurator</div>
          <div style="font-size:15px;margin:5px 0 10px 0;">
            Stel hier zelf uw poort of hekwerk samen. Vraag daarna vrijblijvend uw offerte aan!
          </div>
        `;
        const btn = document.createElement("button");
        btn.className = "leadbot-choice-btn primary";
        btn.textContent = "Start met configureren";
        btn.onclick = () => {
          window.open('https://voorbeeld.nl/configurator','_blank');
          this.sendEvent("link_card_click", {});
        };
        wrap.appendChild(btn);
        this._addBubble({from:"bot", extraEl: wrap});
        this.sendEvent("link_card_view", {});
      }
  
      static sendEvent(type, payload = {}) {
        if (window.dataLayer) {
          window.dataLayer.push({ event: "leadbot_" + type, ...payload });
        }
        if (this.config && this.config.serverBase) {
          fetch(this.config.serverBase + "/track", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": this.config.apiKey || "",
            },
            body: JSON.stringify({ type, payload }),
          });
        }
      }
    }
  
    window.Leadbot = Leadbot;
  })();