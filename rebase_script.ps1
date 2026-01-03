# コミットメッセージの修正スクリプト
# 各コミットを個別に修正する

$commits = @(
    @{ hash = "fc64d0f"; msg = "改善: 連続タップ時にタイマーをリセットして、最後のタップから1秒後に画像が戻るように修正" },
    @{ hash = "2cb01e9"; msg = "修正: 攻撃アニメーション中はupdateExpressionで画像を変更しないようにフラグを追加" },
    @{ hash = "13589b6"; msg = "修正: 攻撃画像の表示時間を延長(500ms→1000ms)とアニメーション停止処理の追加" },
    @{ hash = "ba1986a"; msg = "修正: playTapAnimationでchangeTextureメソッドを使用するように変更" },
    @{ hash = "9146f28"; msg = "修正: changeTextureメソッドでContainerからスプライトを削除する処理を追加" },
    @{ hash = "c06eb03"; msg = "デバッグ: 攻撃画像切り替え時のログ追加と表示時間延長" },
    @{ hash = "85db92b"; msg = "画像対応: スプライトシートから個別画像の切り替えに変更" }
)

foreach ($commit in $commits) {
    Write-Host "修正中: $($commit.hash) - $($commit.msg)"
    $msgFile = "commit_msg_temp.txt"
    $commit.msg | Out-File -FilePath $msgFile -Encoding UTF8 -NoNewline
    git commit --amend -F $msgFile --no-edit
    Remove-Item $msgFile
    git rebase --continue
}

