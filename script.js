// 要素の取得

const textInput = document.getElementById("text")
const partsInput = document.getElementById("parts")
const timeInput = document.getElementById("time")
const intervalInput = document.getElementById("interval")

const addBtn = document.getElementById("addBtn")

const todayMenu = document.getElementById("todayMenu"); 
const allMenu = document.getElementById("allMenu");

// データの取得
let training_menu = JSON.parse(localStorage.getItem("training_menu")) ||[];

// 前データの部分。よくわかっていない。
training_menu.forEach(training_menu => {
  if (!Array.isArray(training_menu.completedDates)) {
    training_menu.completedDates = [];
  }
});

// 追加
addBtn.onclick = () => {
  const text = textInput.value.trim();
  const parts = partsInput.value.trim();
  const startDate = todayString();
  const intervalDays = Number(intervalInput.value);

  if (!text || !parts ||!startDate || intervalDays <= 0) {
    alert("すべてを正しく入力してください");
    return;
  }

//   ()の中身を配列｛｝で入力する。だからpush({})になっている
  training_menu.push({
    text: text,
    parts: parts,
    startDate: startDate,
    intervalDays: intervalDays,
    completedDates: [],
    createdAt: Date.now()
  });

  saveTrainingMenu();
  render();

  // 入力リセット
  textInput.value = "";
  partsInput.value = ""
  intervalInput.value = "";
  timeInput.value = "";

};

// 保存
function saveTrainingMenu() {
  localStorage.setItem("training_menu", JSON.stringify(training_menu));
}

// 今日のメニューと登録済みメニューの移動
function render(){
    todayMenu.innerHTML = "";
    allMenu.innerHTML = "";

    training_menu.forEach((menu, index) => {

        // 念のため補完とあるが理解できず。後で理解する。コピペした。
        if (!Array.isArray(menu.completedDates)) {
            menu.completedDates = [];
            }
        
        // これは、完了を何回押したか。をカウントする
        const doneCount = menu.completedDates.length;

        // 登録済みメニューの部分（右側）
        const allLi = document.createElement("li");
        
        // htmlのspanはどういう意味なのか分からない後でわかるかもしれないので
        // textContentは今回の場合だと、spanタグを作りそのspanタグの文字の中身は＝～～～ですっていう理解
        const textSpan = document.createElement("span");
        textSpan.textContent = `${menu.text}(部位 ${menu.parts})(${menu.intervalDays}日おき/実施${doneCount}回)`

        // 今回の場合だと、ボタンを作り、そのボタンの中の文字は＝削除っていう理解
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "削除";

        deleteBtn.onclick = () => {
            // confirmはOKとキャンセルのウィンドウを出し、それぞれtrue falseの戻り値がでる
            // 今回の場合だと、キャンセルを押すとfalseを戻り、それを否定するので結果的にtureになり、
            // その場合、何も戻さないという処理を行っている。
            if (!confirm("このメニューを削除しますか？")) return;

            // OKの場合、消していいということなので、対応しているindexを1つ削除するという文
            training_menu.splice(index, 1);
            saveTrainingMenu();
            // このrender()をして、一つへったtrainig_menuを再度作り直すことをする。
            // そうしないと、削除を教えても画面上で消えることはない。
            render();

        };

        allLi.appendChild(textSpan);
        allLi.appendChild(deleteBtn);
        allMenu.appendChild(allLi);

        // 今日やるべきことの部分（左側下）
        if (isToday(menu)) {
            const todayLi = document.createElement("li");
            todayLi.textContent = menu.text;

            const doneBtn = document.createElement("button");
            doneBtn.textContent = "完了";

            doneBtn.onclick = () => {
                menu.completedDates.push(todayString())
                saveTrainingMenu();
                render();
            };

            todayLi.appendChild(doneBtn);
            todayMenu.appendChild(todayLi);
        }

    });
}

// 日付
// new Date()でMon May 20 2024 10:00:00 GMT+0900...これがでて、
// toISOString()で2024-05-20T01:23:45.678Zこれに自動で変換して、
// .split("T")[0];でTの部分で二つに分けて、配列にして、前半の部分を戻り値として返す
function todayString() {
  return new Date().toISOString().split("T")[0];
}

// 今日やるべきか判定
function isToday(menu) {
  const todayStr = todayString();

  // 念のため毎回補完。これがよくわからない
  if (!Array.isArray(menu.completedDates)) {
    menu.completedDates = [];
  }

  // 今日すでに完了していたら対象外
  if (menu.completedDates.includes(todayStr)) {
    return false;
  }

//new Date()は計算しやすい形に変形するやつ。作った日時を変形している 
  const today = new Date(todayStr);
//   始めた日を計算しやすい形に変形している。
  const startDate = new Date(menu.startDate);

  // 開始日前は対象外
  if (today < startDate) return false;

//   差を計算している
  const diffDays = Math.floor(
    // ミリ秒を秒にして、分にして、時間にして、日にしている
    (today - startDate) / (1000 * 60 * 60 * 24)
  );
// 初日をゼロとし、間隔に入力した値ｎ日ごに行う。
// そのため、余りがゼロの時、が入力したｎ日後になる。中は-1日。
// 例。3の時、中2日
  return diffDays % menu.intervalDays === 0;
}

// 初期表示。なぜあるかは後で調べる
render();