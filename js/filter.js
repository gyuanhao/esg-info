/**
 * 碳息ESG情报中心 - 文章筛选功能
 * 支持 card-grid（行业页/企业动态）和 policy-list（政策库）两种布局
 */
(function() {
  var sectionInner = document.querySelector('.section-inner');
  if (!sectionInner) return;

  var filterBar = sectionInner.querySelector('div:first-child');
  if (!filterBar) return;

  var filterTags = filterBar.querySelectorAll('.tag');
  if (filterTags.length === 0) return;

  var cardGrid = sectionInner.querySelector('.card-grid');
  var policyList = sectionInner.querySelector('.policy-list');
  var contentContainer = cardGrid || policyList;
  if (!contentContainer) return;

  var items = contentContainer.querySelectorAll('.article-card, .policy-item');
  var allTag = filterTags[0];
  var allTagClassName = allTag.className;

  filterTags.forEach(function(tag) {
    tag.addEventListener('click', function() {
      var label = this.textContent.trim();

      // 重置所有标签为未选中状态
      filterTags.forEach(function(t) {
        t.className = 'tag';
        t.style.background = '#f0f2f5';
        t.style.color = '#666';
        t.style.cursor = 'pointer';
        t.style.padding = '6px 14px';
        t.style.fontSize = '0.85rem';
      });

      // 高亮当前选中的标签（复用"全部"标签的原始样式类）
      this.className = allTagClassName;
      this.style.background = '';
      this.style.color = '';

      // 执行筛选
      items.forEach(function(item) {
        if (label === '全部') {
          item.style.display = '';
          return;
        }

        var matched = false;

        // 方式1：从 .card-tags 中提取标签（行业页/企业动态）
        var cardTagsEl = item.querySelector('.card-tags');
        if (cardTagsEl) {
          var tagTexts = Array.from(cardTagsEl.querySelectorAll('.tag')).map(function(t) {
            return t.textContent.trim();
          });
          if (tagTexts.indexOf(label) !== -1) {
            matched = true;
          }
        }

        // 方式2：从 policy-content p 中提取 "· 标签 ·"（政策库）
        if (!matched) {
          var policyContentP = item.querySelector('.policy-content p');
          if (policyContentP) {
            var text = policyContentP.textContent;
            var regex = /·\s*([^·]+?)\s*·/g;
            var m;
            while ((m = regex.exec(text)) !== null) {
              if (m[1].trim() === label) {
                matched = true;
                break;
              }
            }
          }
        }

        item.style.display = matched ? '' : 'none';
      });
    });
  });
})();
