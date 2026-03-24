@echo off
dotnet ef migrations add AddShipperReview > ef_log.txt 2>&1
dotnet ef database update >> ef_log.txt 2>&1
