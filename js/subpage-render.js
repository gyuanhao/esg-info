/**
 * 碳息ESG情报中心 - 子页面动态渲染器
 * 从 articles.js 读取数据，按分类筛选并渲染文章卡片+分页
 */
(function() {
  var ITEMS_PER_PAGE = 6;
  var currentPage = 1;
  var allArticles = [];
  var filteredArticles = [];
  var activeTag = '全部';

  // 分类图标和颜色
  var catIcons = {
    '金融行业': '🏦', '建筑建材行业': '🏗️', '科技行业': '🤖', '农业行业': '🌾', '政策库': '📋'
  };
  var catColors = {
    '金融行业': ['#E3F2FD','#BBDEFB','金融','🏦'],
    '建筑建材行业': ['#FFF3E0','#FFE0B2','建筑建材','🏗️'],
    '科技行业': ['#F3E5F5','#E1BEE7','科技','🤖'],
    '农业行业': ['#E8F5E9','#C8E6C9','农业','🌾'],
    '政策库': ['#FFF3E0','#FFE0B2','政策','📋']
  };

  function init() {
    var grid = document.getElementById('articleGrid');
    var filterBar = document.getElementById('filterBar');
    var pagination = document.getElementById('pagination');
    if (!grid) return;

    // 读取分类（从 body data-category 属性）
    var category = document.body.getAttribute('data-category') || '';
    if (!category) {
      grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">未指定分类</p>';
      return;
    }

    // 筛选该分类的文章
    allArticles = Object.values(ARTICLES).filter(function(a) {
      return a.category === category;
    }).sort(function(a, b) {
      return b.date.localeCompare(a.date);
    });

    if (allArticles.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">暂无文章</p>';
      return;
    }

    // 收集所有标签（去重）
    var allTags = ['全部'];
    var tagSet = {};
    allArticles.forEach(function(a) {
      (a.tags || []).forEach(function(t) {
        if (!tagSet[t]) { tagSet[t] = true; allTags.push(t); }
      });
    });

    // 渲染筛选标签栏
    if (filterBar && allTags.length > 1) {
      var filterHtml = '';
      allTags.forEach(function(t) {
        var isActive = t === '全部';
        filterHtml += '<span class="filter-tag' + (isActive ? ' active' : '') + '" data-tag="' + t + '" style="cursor:pointer;padding:6px 14px;font-size:0.85rem;border-radius:20px;display:inline-block;' + (isActive ? 'background:var(--primary);color:white;' : 'background:#f0f2f5;color:#666;') + 'margin:0 4px 8px;">' + t + '</span>';
      });
      filterBar.innerHTML = filterHtml;

      // 绑定筛选事件
      filterBar.querySelectorAll('.filter-tag').forEach(function(el) {
        el.addEventListener('click', function() {
          activeTag = this.getAttribute('data-tag');
          currentPage = 1;
          applyFilter();
          updateFilterBar();
        });
      });
    }

    applyFilter();
  }

  function applyFilter() {
    filteredArticles = activeTag === '全部'
      ? allArticles.slice()
      : allArticles.filter(function(a) { return (a.tags || []).indexOf(activeTag) >= 0; });

    renderPage();
  }

  function updateFilterBar() {
    var filterBar = document.getElementById('filterBar');
    if (!filterBar) return;
    filterBar.querySelectorAll('.filter-tag').forEach(function(el) {
      var tag = el.getAttribute('data-tag');
      if (tag === activeTag) {
        el.style.background = 'var(--primary)';
        el.style.color = 'white';
      } else {
        el.style.background = '#f0f2f5';
        el.style.color = '#666';
      }
    });
  }

  function renderPage() {
    var grid = document.getElementById('articleGrid');
    var pagination = document.getElementById('pagination');
    var totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    var start = (currentPage - 1) * ITEMS_PER_PAGE;
    var pageItems = filteredArticles.slice(start, start + ITEMS_PER_PAGE);

    var html = '';
    pageItems.forEach(function(a) {
      var c = catColors[a.category] || ['#E3F2FD','#BBDEFB','ESG','📌'];
      var articleId = Object.keys(ARTICLES).find(function(k) { return ARTICLES[k] === a; });
      var articleUrl = 'article.html?id=' + articleId;
      var tagHtml = '';
      (a.tags || []).forEach(function(t) {
        tagHtml += '<span class="tag tag-policy">' + t + '</span>';
      });

      html += '<article class="article-card">'
        + '<div class="card-image" style="background:linear-gradient(135deg,' + c[0] + ',' + c[1] + ')">'
        + '<span class="tag-overlay"><span class="tag tag-esg">' + c[2] + '</span></span>' + c[3]
        + '</div>'
        + '<div class="card-body">'
        + '<span class="card-category">' + a.category + '</span>'
        + '<h3 class="card-title"><a href="' + articleUrl + '">' + a.title + '</a></h3>'
        + '<p class="card-excerpt">' + a.excerpt + '</p>'
        + '<div class="card-meta"><span>' + a.date + '</span><div class="card-tags">' + tagHtml + '</div></div>'
        + '<a href="' + a.sourceUrl + '" target="_blank" rel="noopener noreferrer" class="card-source-link">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>阅读原文</a>'
        + '</div></article>';
    });

    grid.innerHTML = html;

    // 分页
    if (pagination && totalPages > 1) {
      var pageHtml = '';
      for (var i = 1; i <= totalPages; i++) {
        var isActive = i === currentPage;
        pageHtml += '<span class="page-btn' + (isActive ? ' active' : '') + '" data-page="' + i + '" style="display:inline-block;padding:10px 16px;border-radius:6px;font-size:0.9rem;margin:0 4px;cursor:pointer;' + (isActive ? 'background:var(--primary);color:white;' : 'background:var(--bg-white);color:var(--text-muted);') + '">' + i + '</span>';
      }
      pagination.innerHTML = pageHtml;

      pagination.querySelectorAll('.page-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          currentPage = parseInt(this.getAttribute('data-page'));
          renderPage();
          window.scrollTo({ top: 300, behavior: 'smooth' });
        });
      });
    } else if (pagination) {
      pagination.innerHTML = '';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
