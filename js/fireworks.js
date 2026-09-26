// 順位表で1位の阪神の行が初めて画面に入ったら、その行を金ぴかに光らせながら花火を打ち上げる（1回だけ）
$(function () {
    var row = document.querySelector('#standings .tigers');
    //阪神が1位のときだけ演出する
    if (!row || row.cells[0].textContent !== '1') {
        return;
    }
    //「動きを減らす」設定にしている人などには、動かさずに金色にするだけにする
    if (!window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        row.classList.add('gold');
        return;
    }

    //上のヘッダー(100px)に隠れず、画面の下1/4より上で阪神の行が全部見えたら始める
    var observer = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) {
            return;
        }
        observer.disconnect();
        //読み込み画面(#splash)が出ている間は、消えてからもう一度見えているか確かめる
        if ($('#splash').is(':visible')) {
            setTimeout(function () {
                observer.observe(row);
            }, 300);
            return;
        }
        setTimeout(launch, 600); //フェードインが終わるのを少し待つ
    }, { rootMargin: '-100px 0px -25% 0px', threshold: 1 });
    observer.observe(row);

    function launch() {
        var section = document.getElementById('standings');
        var sectionRect = section.getBoundingClientRect();
        var rowRect = row.getBoundingClientRect();
        var glow = 16; //行のまわりに光がにじむ幅
        var width = rowRect.width + glow * 2;
        var height = rowRect.height + glow * 2;
        var ratio = window.devicePixelRatio || 1;

        //1位の行に重ねるキャンバス（光がにじむ分だけ行より少し大きい）
        var canvas = document.createElement('canvas');
        canvas.className = 'fireworks';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.style.left = (rowRect.left - sectionRect.left - glow) + 'px';
        canvas.style.top = (rowRect.top - sectionRect.top - glow) + 'px';
        section.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        ctx.scale(ratio, ratio);

        //行を金色にして、光の帯が流れるアニメーションを始める（css/standings.css）
        row.classList.add('gold');

        //花火とキラキラは1位の行の中だけに出す
        var area = { x: glow, y: glow, w: rowRect.width, h: rowRect.height };
        //虎の黄色と黒に、赤とオレンジを混ぜる
        var colors = ['#ffcc33', '#000000', '#e60012', '#ff8c00'];
        var mainColors = ['#e60012', '#ff8c00', '#000000']; //1発ごとのメインの色（金色に溶けない色）
        var duration = 3000; //光っている時間
        var bursts = 8;
        var launched = 0;
        var particles = [];
        var flashes = [];
        var sparkles = [];

        //少しずつ時間をずらして、行のあちこちで花火を開かせる（最初の2発は同時）
        for (var i = 0; i < bursts; i++) {
            setTimeout(burst, Math.max(0, i - 1) * 300);
        }

        function burst() {
            var x = area.x + area.w * (0.05 + Math.random() * 0.9);
            var y = area.y + area.h * (0.3 + Math.random() * 0.4);
            var main = mainColors[Math.floor(Math.random() * mainColors.length)];
            var count = 36;
            for (var j = 0; j < count; j++) {
                var angle = Math.PI * 2 * j / count + Math.random() * 0.1;
                var speed = (0.6 + Math.random() * 0.4) * area.h / 25; //行の高さくらいまで広がる
                particles.push({
                    x: x,
                    y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    color: Math.random() < 0.6 ? main : colors[Math.floor(Math.random() * colors.length)]
                });
            }
            flashes.push({ x: x, y: y, life: 1 });
            launched++;
        }

        var start = null;
        var last = null;
        function draw(time) {
            if (start === null) {
                start = time;
            }
            var elapsed = time - start;
            //画面の書き換え速度が違っても同じ速さで動くようにする（60fpsを1とする）
            var step = last === null ? 1 : Math.min((time - last) / (1000 / 60), 3);
            last = time;

            ctx.clearRect(0, 0, width, height);

            //行のまわりを金色にぼんやり光らせる（明るくなったり暗くなったりして、最後はふわっと消える）
            var fade = elapsed < duration - 500 ? 1 : Math.max(0, (duration - elapsed) / 500);
            ctx.save();
            ctx.globalAlpha = (0.6 + 0.4 * Math.sin(elapsed / 1000 * Math.PI * 3)) * fade;
            ctx.shadowColor = '#ffc400';
            ctx.shadowBlur = glow;
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.strokeRect(area.x, area.y, area.w, area.h);
            ctx.restore();

            //ここから下は行の中だけに描く
            ctx.save();
            ctx.beginPath();
            ctx.rect(area.x, area.y, area.w, area.h);
            ctx.clip();

            //金ぴかのキラキラ
            if (elapsed < duration - 500 && Math.random() < 0.4 * step) {
                sparkles.push({
                    x: area.x + Math.random() * area.w,
                    y: area.y + Math.random() * area.h,
                    size: 3 + Math.random() * 4,
                    life: 1
                });
            }
            ctx.fillStyle = '#ffffff';
            sparkles.forEach(function (s) {
                s.life -= 0.04 * step;
                if (s.life <= 0) {
                    return;
                }
                ctx.globalAlpha = Math.sin(s.life * Math.PI); //ふわっと出てふわっと消える
                ctx.beginPath();
                ctx.moveTo(s.x, s.y - s.size);
                ctx.quadraticCurveTo(s.x, s.y, s.x + s.size, s.y);
                ctx.quadraticCurveTo(s.x, s.y, s.x, s.y + s.size);
                ctx.quadraticCurveTo(s.x, s.y, s.x - s.size, s.y);
                ctx.quadraticCurveTo(s.x, s.y, s.x, s.y - s.size);
                ctx.fill();
            });
            sparkles = sparkles.filter(function (s) {
                return s.life > 0;
            });

            //花火が開いた瞬間にパッと光らせる
            flashes.forEach(function (f) {
                f.life -= 0.07 * step;
                if (f.life <= 0) {
                    return;
                }
                var radius = area.h * (0.2 + (1 - f.life) * 0.6);
                var light = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, radius);
                light.addColorStop(0, 'rgba(255, 255, 255, ' + 0.9 * f.life + ')');
                light.addColorStop(1, 'rgba(255, 215, 0, 0)');
                ctx.globalAlpha = 1;
                ctx.fillStyle = light;
                ctx.beginPath();
                ctx.arc(f.x, f.y, radius, 0, Math.PI * 2);
                ctx.fill();
            });
            flashes = flashes.filter(function (f) {
                return f.life > 0;
            });

            //花火の火花
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            particles.forEach(function (p) {
                p.vx *= Math.pow(0.96, step); //空気抵抗
                p.vy = p.vy * Math.pow(0.96, step) + 0.03 * step; //重力
                p.x += p.vx * step;
                p.y += p.vy * step;
                p.life -= 0.015 * step;
                if (p.life <= 0) {
                    return;
                }
                //消える直前はチカチカさせる
                ctx.globalAlpha = p.life < 0.3 ? p.life * Math.random() * 3 : p.life;
                ctx.strokeStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(p.x - p.vx * 4, p.y - p.vy * 4);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            });
            particles = particles.filter(function (p) {
                return p.life > 0;
            });
            ctx.restore();

            //光り終わって、花火も全部消えたらキャンバスを片付ける（行は金色のまま）
            if (elapsed >= duration && launched === bursts && particles.length === 0 && flashes.length === 0 && sparkles.length === 0) {
                canvas.remove();
            } else {
                requestAnimationFrame(draw);
            }
        }
        requestAnimationFrame(draw);
    }
});
