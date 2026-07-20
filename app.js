const state = {
  data: null,
  query: "",
  area: "",
  evidence: "",
  source: "",
  sort: "priority",
};

const refs = {
  refreshStatus: document.querySelector("#refreshStatus"),
  latestDate: document.querySelector("#latestDate"),
  totalCount: document.querySelector("#totalCount"),
  peerCount: document.querySelector("#peerCount"),
  preprintCount: document.querySelector("#preprintCount"),
  areaCount: document.querySelector("#areaCount"),
  coverageNote: document.querySelector("#coverageNote"),
  categoryChart: document.querySelector("#categoryChart"),
  evidenceSummary: document.querySelector("#evidenceSummary"),
  sourceSummary: document.querySelector("#sourceSummary"),
  resultCount: document.querySelector("#resultCount"),
  searchInput: document.querySelector("#searchInput"),
  areaFilter: document.querySelector("#areaFilter"),
  evidenceFilter: document.querySelector("#evidenceFilter"),
  sourceFilter: document.querySelector("#sourceFilter"),
  sortFilter: document.querySelector("#sortFilter"),
  resetFilters: document.querySelector("#resetFilters"),
  activeFilter: document.querySelector("#activeFilter"),
  articleList: document.querySelector("#articleList"),
  emptyState: document.querySelector("#emptyState"),
};

function element(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  }
  children.filter(Boolean).forEach((child) => node.append(child));
  return node;
}

function formatDate(value) {
  const date = new Date(`${value}T00:00:00+08:00`);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function countBy(items, readKey) {
  return items.reduce((counts, item) => {
    const keys = readKey(item);
    (Array.isArray(keys) ? keys : [keys]).filter(Boolean).forEach((key) => {
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, {});
}

function fillSelect(select, values) {
  values.forEach((value) => select.append(element("option", { text: value, attrs: { value } })));
}

function renderHeader(items) {
  const dates = items.map((item) => item.date).sort().reverse();
  refs.latestDate.textContent = dates[0] ? formatDate(dates[0]) : "—";
  refs.totalCount.textContent = String(items.length);
  refs.peerCount.textContent = String(items.filter((item) => item.evidence === "同行评审").length);
  refs.preprintCount.textContent = String(items.filter((item) => item.evidence === "预印本").length);
  refs.areaCount.textContent = String(state.data.categories.length);
  refs.refreshStatus.textContent = `数据同步于 ${state.data.updatedAt}`;
  refs.coverageNote.textContent = state.data.statusMessage;
}

function renderCategories(items) {
  const counts = countBy(items, (item) => item.categories);
  refs.categoryChart.replaceChildren();

  state.data.categories.forEach((category) => {
    const button = element("button", {
      className: `category-card${state.area === category.name ? " is-active" : ""}`,
      attrs: { type: "button", style: `--card-color:${category.color}`, "aria-pressed": state.area === category.name },
    });
    const top = element("div", { className: "category-card__top" }, [
      element("span", { className: "category-card__count", text: counts[category.name] || 0 }),
      element("span", { className: "category-card__marker" }),
    ]);
    button.append(top, element("h3", { text: category.name }), element("p", { text: category.description }));
    button.addEventListener("click", () => {
      state.area = state.area === category.name ? "" : category.name;
      refs.areaFilter.value = state.area;
      renderAll();
      document.querySelector(".section--tinted").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    refs.categoryChart.append(button);
  });
}

function renderEvidence(items) {
  const order = ["同行评审", "预印本", "观点与解读"];
  const counts = countBy(items, (item) => item.evidence);
  const max = Math.max(1, ...Object.values(counts));
  refs.evidenceSummary.replaceChildren();
  order.forEach((label) => {
    const value = counts[label] || 0;
    const labels = element("div", { className: "bar-item__labels" }, [
      element("span", { text: label }),
      element("strong", { text: value }),
    ]);
    const fill = element("div", { className: "bar-fill", attrs: { style: `width:${(value / max) * 100}%` } });
    refs.evidenceSummary.append(element("div", { className: "bar-item" }, [labels, element("div", { className: "bar-track" }, [fill])]));
  });
}

function renderSources(items) {
  const counts = countBy(items, (item) => item.source);
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  refs.sourceSummary.replaceChildren(...rows.map(([name, count]) =>
    element("div", { className: "source-row" }, [element("span", { text: name }), element("strong", { text: count })])
  ));
}

function articleSearchText(item) {
  return [item.title, item.source, item.summary, item.relevance, item.followUp, ...item.categories].join(" ").toLocaleLowerCase("zh-CN");
}

function getFilteredItems() {
  const query = state.query.trim().toLocaleLowerCase("zh-CN");
  const filtered = state.data.items.filter((item) => {
    if (query && !articleSearchText(item).includes(query)) return false;
    if (state.area && !item.categories.includes(state.area)) return false;
    if (state.evidence && item.evidence !== state.evidence) return false;
    if (state.source && item.source !== state.source) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (state.sort === "date") return b.date.localeCompare(a.date) || a.priority - b.priority;
    return a.priority - b.priority || b.date.localeCompare(a.date);
  });
}

function renderArticle(item, index) {
  const evidenceClass = item.evidence === "预印本" ? "tag tag--preprint" : "tag tag--evidence";
  const tags = [
    element("span", { className: evidenceClass, text: item.evidence }),
    ...item.categories.map((name) => element("span", { className: "tag", text: name })),
  ];

  const titleLink = element("a", {
    text: item.title,
    attrs: { href: safeUrl(item.link), target: "_blank", rel: "noreferrer" },
  });
  const insight = element("dl", { className: "insight" }, [
    element("dt", { text: "关联" }),
    element("dd", { text: item.relevance }),
    element("dt", { text: "关注" }),
    element("dd", { text: item.followUp }),
  ]);

  const content = element("div", { className: "article-card__content" }, [
    element("div", { className: "article-card__meta" }, tags),
    element("h3", {}, [titleLink]),
    element("p", { className: "article-card__summary", text: item.summary }),
    insight,
  ]);

  const sideChildren = [
    element("div", {}, [element("span", { text: "来源" }), element("strong", { text: item.source })]),
    element("div", {}, [element("span", { text: "日期" }), element("strong", { text: formatDate(item.date) })]),
    element("div", {}, [element("span", { text: "更新类型" }), element("strong", { text: item.updateType })]),
    element("a", { text: "查看原文 ↗", attrs: { href: safeUrl(item.link), target: "_blank", rel: "noreferrer" } }),
  ];

  return element("article", { className: "article-card" }, [
    element("div", { className: "article-card__rank", text: String(index + 1).padStart(2, "0") }),
    content,
    element("aside", { className: "article-card__side" }, sideChildren),
  ]);
}

function renderArticles() {
  const items = getFilteredItems();
  refs.articleList.replaceChildren(...items.map(renderArticle));
  refs.emptyState.hidden = items.length !== 0;
  refs.resultCount.textContent = `显示 ${items.length} / ${state.data.items.length} 条`;

  const active = [state.area, state.evidence, state.source, state.query && `关键词：${state.query}`].filter(Boolean);
  refs.activeFilter.hidden = active.length === 0;
  refs.activeFilter.textContent = active.length ? `当前筛选：${active.join(" · ")}` : "";
}

function renderAll() {
  renderCategories(state.data.items);
  renderArticles();
}

function bindFilters() {
  refs.searchInput.addEventListener("input", (event) => { state.query = event.target.value; renderArticles(); });
  refs.areaFilter.addEventListener("change", (event) => { state.area = event.target.value; renderAll(); });
  refs.evidenceFilter.addEventListener("change", (event) => { state.evidence = event.target.value; renderArticles(); });
  refs.sourceFilter.addEventListener("change", (event) => { state.source = event.target.value; renderArticles(); });
  refs.sortFilter.addEventListener("change", (event) => { state.sort = event.target.value; renderArticles(); });
  refs.resetFilters.addEventListener("click", () => {
    Object.assign(state, { query: "", area: "", evidence: "", source: "", sort: "priority" });
    document.querySelector("#filters").reset();
    renderAll();
  });
}

async function init() {
  try {
    const response = await fetch("./data/briefs.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();

    fillSelect(refs.areaFilter, state.data.categories.map((category) => category.name));
    fillSelect(refs.sourceFilter, [...new Set(state.data.items.map((item) => item.source))].sort());
    bindFilters();
    renderHeader(state.data.items);
    renderEvidence(state.data.items);
    renderSources(state.data.items);
    renderAll();
  } catch (error) {
    refs.refreshStatus.textContent = "数据加载失败，请稍后刷新";
    refs.articleList.append(element("p", { text: `无法读取简报数据：${error.message}` }));
  }
}

init();
