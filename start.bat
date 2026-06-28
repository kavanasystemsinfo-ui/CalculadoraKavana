@echo off
title ProdCalc - Servidor Local
echo.
echo  ========================================
echo   ProdCalc - Calculadora de Produccion
echo  ========================================
echo.
echo  Iniciando servidor en http://localhost:4200
echo  Pulsa Ctrl+C para detener el servidor.
echo.
npx -y serve . -l 4200
pause
