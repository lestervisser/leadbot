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
          }
          #leadbot-chat {
            position: fixed; bottom: 90px; right: 20px;
            width: 320px; background: #fff;
            border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            font-family: sans-serif; z-index: 999999;
            display: none; flex-direction: column;
          }
          #leadbot-chat header {
            padding: 12px; border-bottom: 1px solid #eee;
            font-weight: bold; display: flex; align-items: center;
          }
          #leadbot-chat header img {
            border-radius: 50%; width: 32px; height: 32px; margin-right: 8px;
          }
          #leadbot-chat .content { padding: 10px; }
          #leadbot-chat button {
            margin: 5px 0; padding: 10px;
            border-radius: 8px; border: 1px solid #ddd;
            background: #f9f9f9; cursor: pointer; width: 100%;
          }
          #leadbot-chat button.primary {
            background: #16a34a; color: white; border: none;
          }
          #leadbot-chat form input, #leadbot-chat form textarea {
            width: 100%; margin: 5px 0; padding: 8px;
            border-radius: 6px; border: 1px solid #ccc;
          }
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
          </header>
          <div class="content" id="leadbot-content">
            <p>Goedemiddag 👋<br/>Kan ik u ergens mee helpen?</p>
            <button data-action="form">Offerte aanvragen</button>
            <button data-action="link" data-url="https://voorbeeld.nl/afspraak">Afspraak maken</button>
            <button data-action="vraag">Ik heb een vraag</button>
            <button data-action="linkcard">Zelf uw hekwerk of poort samenstellen</button>
          </div>
        `;
        document.body.appendChild(chat);
  
        // Launcher toggle
        launcher.addEventListener("click", () => {
          chat.style.display = chat.style.display === "flex" ? "none" : "flex";
        });
  
        // Delegatie
        chat.addEventListener("click", (e) => {
          if (e.target.tagName === "BUTTON") {
            const action = e.target.dataset.action;
            if (action === "form") this.showForm();
            if (action === "link") {
              window.open(e.target.dataset.url, "_blank");
              this.sendEvent("link_click", { url: e.target.dataset.url });
            }
            if (action === "vraag") this.showChannels();
            if (action === "linkcard") this.showLinkCard();
          }
        });
      }
  
      static showForm() {
        const content = document.getElementById("leadbot-content");
        content.innerHTML = `
          <h4>Offerte aanvragen</h4>
          <form id="leadbot-form">
            <input name="name" placeholder="Naam" required />
            <input type="email" name="email" placeholder="E-mail" required />
            <input name="phone" placeholder="Telefoon" />
            <textarea name="message" placeholder="Toelichting"></textarea>
            <button type="submit" class="primary">Versturen</button>
          </form>
        `;
        document.getElementById("leadbot-form").addEventListener("submit", (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.target).entries());
          this.sendEvent("form_submit", data);
          alert("Bedankt, uw aanvraag is verstuurd!");
        });
      }
  
      static showChannels() {
        const content = document.getElementById("leadbot-content");
        content.innerHTML = `
          <p>Via welk kanaal wil je contact?</p>
          <button data-channel="whatsapp">WhatsApp</button>
          <button data-channel="callback">Bel me terug</button>
          <button data-channel="email">E-mail</button>
          <button data-channel="phone">Telefoon</button>
        `;
        content.querySelectorAll("button").forEach((btn) => {
          btn.addEventListener("click", () => {
            const ch = btn.dataset.channel;
            if (ch === "whatsapp") this.showWhatsApp();
            else alert("Kanaal gekozen: " + ch);
            this.sendEvent("channel_select", { channel: ch });
          });
        });
      }
  
      static showWhatsApp() {
        const content = document.getElementById("leadbot-content");
        content.innerHTML = `
          <p>Typ een bericht om contact op te nemen via WhatsApp.</p>
          <input id="wa-message" placeholder="Uw bericht..." />
          <button id="wa-send" class="primary">Open WhatsApp</button>
        `;
        document.getElementById("wa-send").addEventListener("click", () => {
          const msg = encodeURIComponent(document.getElementById("wa-message").value);
          const url = "https://wa.me/31612345678?text=" + msg;
          this.sendEvent("whatsapp_start", { message: msg });
          window.open(url, "_blank");
        });
      }
  
      static showLinkCard() {
        const content = document.getElementById("leadbot-content");
        content.innerHTML = `
          <h4>Poort & Hekwerk Configurator</h4>
          <p>Stel hier zelf uw poort of hekwerk samen. Vraag daarna vrijblijvend uw offerte aan!</p>
          <button class="primary" onclick="window.open('https://voorbeeld.nl/configurator','_blank')">Start met configureren</button>
        `;
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