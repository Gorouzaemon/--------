// セ・リーグ順位表
// 更新するときは、下の日付と各チームの勝利・敗戦・引分の数字だけ書き換える。
// 試合数・勝率・勝差・順位は自動で計算される。（並び順も自動）
var standingsDate = '2026年9月25日時点';
var standingsTeams = [
    { name: '阪神', win: 75, lose: 59, draw: 1 },
    { name: '巨人', win: 74, lose: 62, draw: 2 },
    { name: 'DeNA', win: 69, lose: 66, draw: 3 },
    { name: 'ヤクルト', win: 58, lose: 76, draw: 2 },
    { name: '中日', win: 59, lose: 79, draw: 2 },
    { name: '広島', win: 56, lose: 75, draw: 4 }
];

$(function () {
    //勝率は引き分けを除いて計算する（勝利÷(勝利+敗戦)）
    function winRate(team) {
        var played = team.win + team.lose;
        return played === 0 ? 0 : team.win / played;
    }

    //勝率の高い順に並べる（同じ勝率なら勝利数の多い順）
    var teams = standingsTeams.slice().sort(function (a, b) {
        return winRate(b) - winRate(a) || b.win - a.win;
    });
    var top = teams[0];
    var rank = 0;
    var rows = '';

    $.each(teams, function (i, team) {
        //勝率が1つ上のチームと同じなら同じ順位にする
        if (i === 0 || winRate(team) !== winRate(teams[i - 1])) {
            rank = i + 1;
        }
        //勝率は「.560」のように小数点以下3桁で表示
        var played = team.win + team.lose;
        var rate = played === 0 ? 0 : Math.round(team.win * 1000 / played);
        var rateText = rate === 1000 ? '1.000' : '.' + ('00' + rate).slice(-3);
        //勝差は首位とのゲーム差
        var gap = ((top.win - team.win) + (team.lose - top.lose)) / 2;
        var gapText = i === 0 ? '-' : gap.toFixed(1);

        rows += '<tr' + (team.name === '阪神' ? ' class="tigers"' : '') + '>'
            + '<td>' + rank + '</td>'
            + '<td>' + team.name + '</td>'
            + '<td>' + (team.win + team.lose + team.draw) + '</td>'
            + '<td>' + team.win + '</td>'
            + '<td>' + team.lose + '</td>'
            + '<td>' + team.draw + '</td>'
            + '<td>' + rateText + '</td>'
            + '<td>' + gapText + '</td>'
            + '</tr>';
    });

    $('.standings-date').text(standingsDate);
    $('.standings-table tbody').html(rows);
});
