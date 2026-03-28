document.addEventListener('DOMContentLoaded', () => {
  const panels = document.querySelectorAll('.panel');
  const panelsContainer = document.querySelector('.panels');
  const hoverPanel = document.getElementById('hoverPanel');
  const hoverFooter = document.getElementById('hoverFooter');
  const stage = document.querySelector('.stage');
  let selectedPanel = null;
  let contentData = {};

  fetch('data-content.yaml')
    .then(res => res.text())
    .then(text => { contentData = jsyaml.load(text); })
    .catch(() => console.warn('Could not load data-content.yaml'));

  function getPanelKey(panel) {
    return [...panel.classList].find(c => c !== 'panel' && c !== 'selected');
  }

  function renderFilmSamples(items) {
    let html = '<div class="film-samples">';
    items.forEach(group => {
      html += `<div class="film-role-group">
        <h3 class="film-role-label">${group.role}</h3>
        <div class="film-role-items">`;
      group.films.forEach(film => {
        html += `
          <a href="${film.link}" target="_blank" rel="noopener" class="film-item">
            <img class="sample-thumb" data-url="${film.link}" alt="${film.title}">
            <span class="film-item-title">${film.title}</span>
          </a>`;
      });
      html += '</div></div>';
    });
    html += '</div>';
    return html;
  }

  function renderPanelContent(key) {
    const data = contentData[key];
    if (!data) return '<p>Content coming soon...</p>';

    let html = '';

    if (data.images && data.images.length) {
      html += '<div class="content-images">';
      data.images.forEach(img => {
        html += `<img src="images/active/${key}/${img}" alt="">`;
      });
      html += '</div>';
    }

    if (data.summary) {
      html += `<div class="content-text">${data.summary}</div>`;
    }

    const samplesKey = Object.keys(data).find(k => k.endsWith('_samples'));
    if (samplesKey && data[samplesKey].length) {
      if (samplesKey === 'film_samples') {
        html += renderFilmSamples(data[samplesKey]);
      } else {
        html += '<div class="writing-samples">';
        data[samplesKey].forEach(group => {
          html += `<div class="writing-publisher-group">
            <h3 class="writing-publisher-label">${group.publisher}</h3>
            <div class="writing-publisher-items">`;
          group.pieces.forEach(piece => {
            html += `
              <a href="${piece.link}" target="_blank" rel="noopener" class="writing-item">
                <img class="sample-thumb" data-url="${piece.link}" alt="${piece.title}">
                <span class="writing-item-title">${piece.title}</span>
              </a>`;
          });
          html += '</div></div>';
        });
        html += '</div>';
      }
    }

    return html;
  }

  function loadSampleThumbnails() {
    document.querySelectorAll('.sample-thumb').forEach(async img => {
      try {
        const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(img.dataset.url)}`);
        const json = await res.json();
        const thumb = json.data?.image?.url;
        if (thumb) img.src = thumb;
      } catch (e) { /* thumbnail unavailable */ }
    });
  }

  panels.forEach(panel => {
    panel.addEventListener('click', () => {
      if (selectedPanel === panel) {
        selectedPanel.classList.remove('selected');
        selectedPanel = null;
        hoverPanel.classList.remove('open');
        panelsContainer.classList.remove('collapsed');
        hoverFooter.innerHTML = 'Hover a panel';
        return;
      }

      if (selectedPanel) selectedPanel.classList.remove('selected');

      selectedPanel = panel;
      panel.classList.add('selected');

      hoverFooter.innerHTML = renderPanelContent(getPanelKey(panel));
      loadSampleThumbnails();
      hoverPanel.classList.add('open');
      panelsContainer.classList.add('collapsed');
    });
  });

  document.addEventListener('click', (e) => {
    if (!stage.contains(e.target)) {
      if (selectedPanel) {
        selectedPanel.classList.remove('selected');
        selectedPanel = null;
      }
      hoverPanel.classList.remove('open');
      panelsContainer.classList.remove('collapsed');
      hoverFooter.innerHTML = 'Hover a panel';
    }
  });
});
