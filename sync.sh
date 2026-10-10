#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "==> 暂存文件..."
git add src/App.jsx src/data/dealerMockData.js

echo "==> 提交..."
git commit -m "feat: update App and add dealer mock data"

echo "==> 推送到远程仓库..."
git push origin main

echo "==> 完成!"
