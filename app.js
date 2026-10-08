// PatNav emergency page. Opened by scanning an Emergency Mode QR code:
//   https://attayah.github.io/patnav-emergency/#t=<token>
// The token is in the URL fragment (after #), which browsers never send to
// the server, so GitHub Pages never sees it. It's sent only to the
// emergency-view Edge Function, which checks it on every request.
//
// Everything is rendered with textContent (never innerHTML), so nothing a
// person typed into their profile can run as code on this page.
(function () {
  var ENDPOINT = 'https://querazgfxbqrkulnrdsu.supabase.co/functions/v1/emergency-view';
  var INACTIVE =
    "This link isn't active. It may have expired or been turned off. Ask the person, or someone with them, to open Emergency Mode in PatNav and show a new code.";

  var heading = document.getElementById('heading');
  var status = document.getElementById('status');
  var sectionsEl = document.getElementById('sections');
  var retry = document.getElementById('retry');

  var match = /(?:^|[#&])t=([0-9a-f]{64})(?:&|$)/.exec(window.location.hash);
  var token = match ? match[1] : null;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function formatDate(value) {
    if (!value) return 'Not yet updated';
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  }

  function showMessage(title, message, canRetry) {
    heading.textContent = title;
    status.textContent = message;
    sectionsEl.textContent = '';
    retry.hidden = !canRetry;
  }

  function render(sections) {
    heading.textContent = 'Emergency Care Profile';
    status.textContent = 'Shared for emergency use. Everything below is entered by the person themselves.';
    retry.hidden = true;
    sectionsEl.textContent = '';
    sections.forEach(function (section) {
      var card = el('section', 'card');
      card.appendChild(el('h2', null, section.title));
      card.appendChild(el('p', 'updated', 'Last updated: ' + formatDate(section.updatedAt)));
      if (!section.items || section.items.length === 0) {
        card.appendChild(el('p', 'empty', 'Nothing entered yet.'));
      } else {
        section.items.forEach(function (item) {
          var row = el('div', 'item');
          row.appendChild(el('div', 'title', item.title));
          if (item.detail) row.appendChild(el('div', 'detail', item.detail));
          card.appendChild(row);
        });
      }
      card.appendChild(el('span', 'tag', 'User-entered'));
      sectionsEl.appendChild(card);
    });
  }

  function load() {
    if (!token) {
      showMessage('Link not available', INACTIVE, false);
      return;
    }
    showMessage('Emergency Care Profile', 'Loading…', false);
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token }),
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    })
      .then(function (response) {
        return response.json().then(
          function (body) { return { ok: response.ok, body: body }; },
          function () { return { ok: false, body: null }; }
        );
      })
      .then(function (result) {
        if (result.ok && result.body && result.body.status === 'ok') {
          render(result.body.sections || []);
        } else if (result.body && result.body.status === 'inactive') {
          showMessage('Link not available', INACTIVE, false);
        } else {
          showMessage('Could not load', 'Something went wrong loading this page. Please try again in a moment.', true);
        }
      })
      .catch(function () {
        showMessage('Could not load', 'Could not connect. Check the internet connection, then try again.', true);
      });
  }

  retry.addEventListener('click', load);
  load();
})();
