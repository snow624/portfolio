document.addEventListener("DOMContentLoaded", async () => {
    const isWorksPage = location.pathname.includes("/works/");
    const base = isWorksPage ? "../" : "./";

    // 1) 共通レイアウト
    await loadLayout("#header", base + "header.html");
    await loadLayout("#footer", base + "footer.html");
    fixHeaderPaths(base, isWorksPage);

    // 2) 共通UI
    initMenu();

    // 3) ページ別（存在したら実行）
    if (document.querySelector("#mvThumbList")) initCharacterSelect();
    if (document.querySelector(".workModal")) initWorkModal();
    if (document.querySelector("#workHeroThumbList")) initWorkHeroThumbs();

    if (document.querySelector("#workHeroThumbList")) initWorkHeroGallery();
});


async function loadLayout(selector, path) {
    const target = document.querySelector(selector);
    if (!target) return;

    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load: ${path} (${res.status})`);
    target.innerHTML = await res.text();
}

// ヘッダー・フッターで画像表示
function fixHeaderPaths(base, isWorksPage) {
    const header = document.querySelector("#header", "#footer");
    if (!header || !isWorksPage) return;

    header.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.href = base + "index.html" + a.getAttribute("href");
    });

    header.querySelectorAll('img[src^="img/"]').forEach((img) => {
        img.src = base + img.getAttribute("src");
    });

    footer.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.href = base + "index.html" + a.getAttribute("href");
    });

    footer.querySelectorAll('img[src^="img/"]').forEach((img) => {
        img.src = base + img.getAttribute("src");
    });
}


function initMenu() {
    const nav = document.querySelector(".header-nav");
    const hamburger = document.querySelector(".hamburger");
    const overlay = document.querySelector(".menu-overlay");
    if (!nav || !hamburger || !overlay) return;

    // ★ 初期状態を強制的に閉じる（リロード対策）
    hamburger.classList.remove("is-active");
    nav.classList.remove("is-open");
    overlay.classList.remove("is-open");
    overlay.hidden = true;
    document.body.classList.remove("is-menu-open");
    hamburger.setAttribute("aria-expanded", "false");


    // ===== メニュー開閉（イベント委譲）=====
    function openMenu(btn, nav, overlay) {
        btn.classList.add("is-active");
        nav.classList.add("is-open");
        overlay.hidden = false;
        overlay.classList.add("is-open");
        document.body.classList.add("is-menu-open");
        btn.setAttribute("aria-expanded", "true");
    }

    function closeMenu(btn, nav, overlay) {
        btn.classList.remove("is-active");
        nav.classList.remove("is-open");
        overlay.classList.remove("is-open");
        document.body.classList.remove("is-menu-open");
        btn.setAttribute("aria-expanded", "false");

        // フェード後にhidden（クリック不可に）
        window.setTimeout(() => {
            overlay.hidden = true;
        }, 200);
    }

    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".hamburger");
        const link = e.target.closest(".header-nav a");
        const overlay = document.querySelector(".menu-overlay");

        // header がまだ無い時は何もしない
        const nav = document.querySelector(".header-nav");
        const hamburger = document.querySelector(".hamburger");
        if (!nav || !hamburger || !overlay) return;

        // ハンバーガー押下
        if (btn) {
            const isOpen = nav.classList.contains("is-open");
            if (isOpen) closeMenu(hamburger, nav, overlay);
            else openMenu(hamburger, nav, overlay);
            return;
        }

        // メニュー内リンクを押したら閉じる
        if (link) {
            closeMenu(hamburger, nav, overlay);
            return;
        }

        // オーバーレイ押したら閉じる
        if (e.target.classList.contains("menu-overlay")) {
            closeMenu(hamburger, nav, overlay);
        }
    });

    // Esc で閉じる
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;

        const nav = document.querySelector(".header-nav");
        const hamburger = document.querySelector(".hamburger");
        const overlay = document.querySelector(".menu-overlay");
        if (!nav || !hamburger || !overlay) return;

        if (nav.classList.contains("is-open")) {
            closeMenu(hamburger, nav, overlay);
        }
    });
    // ※必ず nav/hamburger/overlay が無ければ return する形にする
}

// キャラクターセレクト
function initCharacterSelect() {
    const mv = document.querySelector(".mv-select");
    if (!mv) return;

    const characters = [
        {
            name: "Yuki Kawakami",
            role: "Web Design / Frontend / Laravel",
            img: "./img/me.png",
            type: "Creator",
            skill: "HTML / CSS / JavaScript",
            special: "Design → Coding",
            bars: { design: 90, front: 80, back: 55 }
        },
        {
            name: "Frontend Mode",
            role: "UI / Animation / Responsive",
            img: "./img/front.png",
            type: "Frontend",
            skill: "HTML / CSS / JS",
            special: "Motion & Layout",
            bars: { design: 70, front: 88, back: 35 }
        },
        {
            name: "Backend Mode",
            role: "Laravel / CRUD / DB",
            img: "./img/back.png",
            type: "Backend",
            skill: "PHP / Laravel / MySQL",
            special: "CRUD & API",
            bars: { design: 45, front: 55, back: 80 }
        },
        {
            name: "Design Mode",
            role: "Illustrator / Photoshop / Figma",
            img: "./img/design.png",
            type: "Designer",
            skill: "AI / PS / Figma",
            special: "Brand & Visual",
            bars: { design: 92, front: 50, back: 25 }
        }
    ];

    const el = {
        portrait: document.getElementById("mvPortrait"),
        name: document.getElementById("mvName"),
        role: document.getElementById("mvRole"),
        type: document.getElementById("mvType"),
        skill: document.getElementById("mvSkill"),
        special: document.getElementById("mvSpecial"),
        barDesign: document.getElementById("barDesign"),
        barFront: document.getElementById("barFront"),
        barBack: document.getElementById("barBack"),
        thumbs: document.getElementById("mvThumbList"),
    };

    // 必須DOMが無ければ終了
    if (!el.portrait || !el.name || !el.role || !el.thumbs) return;

    let idx = 0;

    function setBars(bars) {
        el.barDesign?.style.setProperty("--w", `${bars.design}%`);
        el.barFront?.style.setProperty("--w", `${bars.front}%`);
        el.barBack?.style.setProperty("--w", `${bars.back}%`);
    }

    function render() {
        const c = characters[idx];
        el.portrait.src = c.img;
        el.name.textContent = c.name;
        el.role.textContent = c.role;
        el.type && (el.type.textContent = c.type);
        el.skill && (el.skill.textContent = c.skill);
        el.special && (el.special.textContent = c.special);
        setBars(c.bars);

        [...el.thumbs.children].forEach((t, i) => {
            t.classList.toggle("is-active", i === idx);
        });
    }

    // thumbs生成
    el.thumbs.innerHTML = characters.map((c, i) => `
      <button class="mv-thumb ${i === 0 ? "is-active" : ""}" type="button" data-i="${i}">
        <img src="${c.img}" alt="">
      </button>
    `).join("");

    el.thumbs.addEventListener("click", (e) => {
        const b = e.target.closest(".mv-thumb");
        if (!b) return;
        idx = Number(b.dataset.i);
        render();
    });

    // 左右ボタン
    document.querySelectorAll(".mv-arrow").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            const dir = Number(btn.dataset.dir);
            idx = (idx + dir + characters.length) % characters.length;
            render();
            el.thumbs.children[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        });
    });

    render();
}

// ファイル
function initWorkModal() {
    const modal = document.querySelector(".workModal");
    const modalImg = document.querySelector(".workModal__img");
    const bg = document.querySelector(".workModal__bg");
    const closeBtn = document.querySelector(".workModal__close");
    const shots = document.querySelectorAll(".shot");

    if (!modal || !modalImg || !shots.length) return;

    const open = (src) => {
        modalImg.src = src;
        modal.hidden = false;
        document.body.classList.add("is-menu-open");
    };
    const close = () => {
        modal.hidden = true;
        modalImg.src = "";
        document.body.classList.remove("is-menu-open");
    };

    shots.forEach(btn => btn.addEventListener("click", () => open(btn.dataset.img)));
    bg?.addEventListener("click", close);
    closeBtn?.addEventListener("click", close);
    document.addEventListener("keydown", (e) => (e.key === "Escape" && !modal.hidden) && close());
}

// ファイルのサムネ
function initWorkHeroThumbs() {
    const list = document.getElementById("workHeroThumbList");
    if (!list) return;

    // works 詳細ページ用（/works/ 配下想定）
    const items = [
        { href: "./file01.html", img: "../img/works-01.png", alt: "work 1" },
        { href: "./file02.html", img: "../img/works-02.png", alt: "work 2" },
        { href: "./file03.html", img: "../img/works-03.png", alt: "work 3" },
        { href: "./file04.html", img: "../img/works-04.png", alt: "work 4" },
        { href: "./file05.html", img: "../img/works-05.png", alt: "work 5" },
        { href: "./file06.html", img: "../img/works-06.png", alt: "work 6" },
    ];

    const current = location.pathname.split("/").pop(); // file02.html など

    list.innerHTML = items.map((it) => {
        const active = (it.href.replace("./", "") === current) ? "is-active" : "";
        return `
        <a class="workHeroThumb ${active}" href="${it.href}" aria-label="${it.alt}">
          <img src="${it.img}" alt="">
        </a>
      `;
    }).join("");

    // 左右ボタン：リストを横スクロール
    document.querySelectorAll(".workHero-arrow").forEach((btn) => {
        btn.addEventListener("click", () => {
            const dir = Number(btn.dataset.dir);
            list.scrollBy({ left: dir * 180, behavior: "smooth" });
        });
    });

    // アクティブなサムネを中央付近へ寄せる
    list.querySelector(".is-active")?.scrollIntoView({ inline: "center", block: "nearest" });
}
function initWorkHeroGallery() {
    const main = document.getElementById("workHeroMain");
    const list = document.getElementById("workHeroThumbList");
    if (!main || !list) return;

    // どの作品ページか判定（file02.html など）
    const page = location.pathname.split("/").pop();

    // ★ページごとに「別画像」を定義
    const galleries = {
        "laravel-system": [
            "../img/works-01.png",
            "../img/works/file01-01.png",
            "../img/works/file01-02.png",
            "../img/works/file01-03.png",
        ],
        "poire-clinic": [
            "../img/works-02.png",
            "../img/works/file02-01.png",
            "../img/works/file02-02.png",
            "../img/works/file02-03.png",

        ],
        "portfolio-site": [
            "../img/works-03.png",
            "../img/works/file03-01.png",
            "../img/works/file03-02.png",
            "../img/works/file03-03s.png",
        ],
        "aika-dtp.html": [
            "../img/works-04.png",
            "../img/works/file04-01.png",
            "../img/works/file04-02.png",
            "../img/works/file04-03.png",

        ],
        "cytech-character-design.html": [
            "../img/works-05.png",
            "../img/works/file05-01.png",
            "../img/works/file05-02.png",
            "../img/works/file05-03.png",
            "../img/works/file05-04.png",
            "../img/works/file05-05.png",

        ],
        "line-stamp.html": [
            "../img/works-06.png",
            "../img/works/file06-01.png",
            "../img/works/file06-02.png",
            "../img/works/file06-03.png",

        ],
    };

    const shots = galleries[page];
    if (!shots || !shots.length) return;

    let idx = 0;

    // 初期表示：メイン画像を1枚目に
    main.src = shots[0];

    // サムネ生成
    list.innerHTML = shots
        .map((src, i) => `
        <button class="workHeroThumb ${i === 0 ? "is-active" : ""}" type="button" data-i="${i}">
          <img src="${src}" alt="">
        </button>
      `)
        .join("");

    const thumbs = [...list.querySelectorAll(".workHeroThumb")];

    function setActive(i) {
        idx = i;
        main.src = shots[idx];
        thumbs.forEach((t, n) => t.classList.toggle("is-active", n === idx));
        thumbs[idx]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }

    // クリックで切替
    list.addEventListener("click", (e) => {
        const btn = e.target.closest(".workHeroThumb");
        if (!btn) return;
        setActive(Number(btn.dataset.i));
    });

    // 左右ボタンで切替
    document.querySelectorAll(".workHero-arrow").forEach((btn) => {
        btn.addEventListener("click", () => {
            const dir = Number(btn.dataset.dir);
            const next = (idx + dir + shots.length) % shots.length;
            setActive(next);
        });
    });
}
