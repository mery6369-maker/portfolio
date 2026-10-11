@echo off
chcp 65001 > nul
title 차예인 포트폴리오 로컬 비주얼 편집기 (Local Visual Editor)
echo ======================================================
echo  [차예인 포트폴리오] 로컬 비주얼 편집기를 시작합니다...
echo  - 브라우저 주소: http://localhost:5173
echo  - 외부인은 접속할 수 없는 100%% 안전한 내 PC 전용 편집기입니다.
echo ======================================================
cd /d "D:\240811_PF\01_웹포트폴리오_소스코드\260713_PF"
start http://localhost:5173
cmd.exe /c "npx vite --port 5173"
pause
