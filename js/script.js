// 保存済みの配列を取得する
const customers = (JSON.parse(
  localStorage.getItem("customer-memo-customers")
) || []).map(function ([company, detail]) {
  // 旧形式のLP問い合わせを1件として引き継ぐ
  const inquiryCount = typeof detail === "number" ? detail :
    Number(detail === "LPからの問い合わせ" || detail === "共同LPからの問い合わせ");
  return [company, inquiryCount];
});

// 公開後に自動で届く問い合わせの順番とタイミング
const scheduledInquiries = [
  { company: "株式会社グー", delay: 3000 },
  { company: "株式会社チョキ", delay: 7500 },
  { company: "株式会社パー", delay: 12000 },
  { company: "株式会社グー", delay: 17000 }
];

// 顧客一覧を表示する
function showCustomers() {

  $("#list").empty();

  for (let i = 0; i < customers.length; i++) {

    const company = customers[i][0];
    const inquiryCount = customers[i][1];

    const item = $("<li>");
    const companyText = $("<h3>").text(company);

    // 編集ボタン
    const editButton = $("<button>")
      .attr("type", "button")
      .addClass("edit")
      .attr("data-index", i)
      .text("編集");

    // 削除ボタン
    const deleteButton = $("<button>")
      .attr("type", "button")
      .addClass("delete")
      .attr("data-index", i)
      .text("削除");

    item.append(companyText);
    if (inquiryCount > 0) {
      item.append($("<span>")
        .addClass("inquiry-count")
        .text("LPからの問い合わせ " + inquiryCount + "件"));
    }
    item.append(editButton);
    item.append(deleteButton);

    $("#list").append(item);
  }

  // 件数を表示する
  $("#record-count").text(customers.length + "件");

  // 記録がないときだけ案内を表示する
  if (customers.length === 0) {
    $("#empty-message").show();
  } else {
    $("#empty-message").hide();
  }
}

// 配列を保存し、一覧を表示し直す
function saveCustomers() {

  localStorage.setItem(
    "customer-memo-customers",
    JSON.stringify(customers)
  );

  console.log("保存後の顧客台帳：", customers);

  showCustomers();
}

// ページを開いたときに一覧を復元する
showCustomers();

// 手入力で登録する
$("#customer-form").on("submit", function (event) {
  event.preventDefault();

  const company = $("#company").val().trim();

  // 企業名が空なら登録しない
  if (company === "") {
    console.log("企業名を入力してください");

    $("#form-message")
      .addClass("is-error")
      .text("企業名を入力してください。");

    $("#company").focus();
    return;
  }

  customers.push([company, 0]);

  console.log("手入力で登録：", company);

  saveCustomers();

  // 入力欄を空にする
  $("#company").val("");

  $("#form-message")
    .removeClass("is-error")
    .text(company + "を登録しました。");

  $("#company").focus();
});

// LPを公開すると、順番に問い合わせが届く
$("#publish").one("click", function () {
  $("#published").prop("hidden", false);
  $("#publication-status").addClass("is-published").text("公開中");
  $("#unpublished").prop("hidden", true);

  scheduledInquiries.forEach(function ({ company, delay }) {
    setTimeout(function () {
      recordInquiry(company);
    }, delay);
  });
});

function recordInquiry(company) {
  const existingCustomer = customers.find(function ([registeredCompany]) {
    return registeredCompany.trim() === company;
  });

  if (existingCustomer) {
    existingCustomer[1] += 1;
  } else {
    customers.push([company, 1]);
  }

  const status = $("<span>")
    .addClass("inquiry-status")
    .toggleClass("is-existing", Boolean(existingCustomer))
    .text(existingCustomer ? "登録済み" : "新規");

  const entry = $("<li>").append($("<span>").text(company), status);

  saveCustomers();
  $("#inquiry-waiting").prop("hidden", true);
  $("#inquiry-log").append(entry);
}

// 1件削除する
$("#list").on("click", ".delete", function () {

  const index = Number($(this).attr("data-index"));

  console.log("削除する記録：", customers[index]);

  customers.splice(index, 1);

  saveCustomers();
});

// 1件編集する
$("#list").on("click", ".edit", function () {

  const index = Number($(this).attr("data-index"));

  const company = prompt(
    "企業名を編集してください",
    customers[index][0]
  );

  if (company === null) {
    return;
  }

  if (company.trim() === "") {
    console.log("企業名は空にできません");

    $("#form-message")
      .addClass("is-error")
      .text("企業名は空にできません。編集は保存されませんでした。");

    return;
  }

  customers[index][0] = company.trim();

  console.log("編集した記録：", customers[index]);

  saveCustomers();

  $("#form-message")
    .removeClass("is-error")
    .text("記録を更新しました。");
});
