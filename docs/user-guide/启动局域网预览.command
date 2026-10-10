#!/bin/zsh

SCRIPT_DIR="${0:A:h}"
PORT="8088"
LAN_IP="$(ipconfig getifaddr en1 2>/dev/null || ipconfig getifaddr en0 2>/dev/null)"

echo "经销商 APP 测试账号操作指南"
echo "本机访问：http://127.0.0.1:${PORT}/"
if [[ -n "${LAN_IP}" ]]; then
  echo "局域网访问：http://${LAN_IP}:${PORT}/"
fi
echo "关闭此窗口或按 Control+C 可停止服务。"
echo ""

python3 -m http.server "${PORT}" --bind 0.0.0.0 --directory "${SCRIPT_DIR}"
