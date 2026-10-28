@echo off
title Seed Polarise Telecom Database
echo Seeding Polarise Telecom Technology database with 13 official accounts...
cd backend && python seed_data.py
pause
