(function () {
  const READY_EVENT = '47CampaignWidgetReady';
  const STYLE_ID = 'campaign-widget-styles';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .campaign-widget { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; border-radius: 16px; padding: 1rem 1.25rem; box-shadow: 0 14px 28px rgba(15, 23, 42, 0.14); border: 1px solid rgba(120, 144, 156, 0.2); }
      .campaign-widget--light { background: #ffffff; color: #1f2933; }
      .campaign-widget--dark { background: #0f172a; color: #e2e8f0; border-color: rgba(148, 163, 184, 0.3); box-shadow: 0 18px 30px rgba(15, 23, 42, 0.4); }
      .campaign-widget__header { font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; margin-bottom: 0.75rem; }
      .campaign-widget__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.75rem; }
      .campaign-widget__item a { color: inherit; font-weight: 600; text-decoration: none; }
      .campaign-widget__item a:hover { text-decoration: underline; }
      .campaign-widget__meta { display: block; font-size: 0.75rem; opacity: 0.7; margin-top: 0.25rem; }
      .campaign-widget__empty { font-size: 0.85rem; opacity: 0.8; }
    `;
    document.head.appendChild(style);
  }

  function renderWidget(container, options) {
    const theme = options.theme === 'dark' ? 'dark' : 'light';
    container.innerHTML = '';

    ensureStyles();

    const wrapper = document.createElement('div');
    wrapper.className = `campaign-widget campaign-widget--${theme}`;

    const header = document.createElement('div');
    header.className = 'campaign-widget__header';
    header.innerHTML = '<span>Campaign Wire</span>';

    const list = document.createElement('ul');
    list.className = 'campaign-widget__list';

    wrapper.appendChild(header);
    wrapper.appendChild(list);
    container.appendChild(wrapper);

    fetch(options.endpoint)
      .then((response) => response.json())
      .then((payload) => {
        const items = Array.isArray(payload?.items) ? payload.items.slice(0, 5) : [];
        if (!items.length) {
          list.innerHTML = '<li class="campaign-widget__empty">No live updates.</li>';
          return;
        }

        items.forEach((item) => {
          const li = document.createElement('li');
          li.className = 'campaign-widget__item';
          const link = document.createElement('a');
          link.href = item.url;
          link.target = '_blank';
          link.rel = 'noopener';
          link.textContent = item.title;
          li.appendChild(link);

          const meta = document.createElement('span');
          meta.className = 'campaign-widget__meta';
          meta.textContent = new Date(item.timestamp).toLocaleString();
          li.appendChild(meta);

          list.appendChild(li);
        });
      })
      .catch(() => {
        list.innerHTML = '<li class="campaign-widget__empty">Unable to load updates.</li>';
      });
  }

  function bootstrap() {
    const containers = Array.from(
      document.querySelectorAll('#campaign-widget, .campaign-widget-host')
    );

    containers.forEach((container) => {
      const preset = container.getAttribute('data-preset') || 'headlines-light';
      const endpoint = container.getAttribute('data-endpoint');
      if (!endpoint) {
        console.warn('[47CampaignWidget] Missing data-endpoint attribute.');
        return;
      }

      renderWidget(container, { preset, endpoint, theme: preset.includes('dark') ? 'dark' : 'light' });
    });

    document.dispatchEvent(new CustomEvent(READY_EVENT));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
