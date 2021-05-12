@echo off
rem
rem Copyright (C) 1994, 2018, Oracle and/or its affiliates. All rights reserved.
rem Oracle and Java are registered trademarks of Oracle and/or its
rem affiliates. Other names may be trademarks of their respective owners.
rem UNIX is a registered trademark of The Open Group.
rem
rem This software and related documentation are provided under a license
rem agreement containing restrictions on use and disclosure and are
rem protected by intellectual property laws. Except as expressly permitted
rem in your license agreement or allowed by law, you may not use, copy,
rem reproduce, translate, broadcast, modify, license, transmit, distribute,
rem exhibit, perform, publish, or display any part, in any form, or by any
rem means. Reverse engineering, disassembly, or decompilation of this
rem software, unless required by law for interoperability, is prohibited.
rem The information contained herein is subject to change without notice
rem and is not warranted to be error-free. If you find any errors, please
rem report them to us in writing.
rem U.S. GOVERNMENT END USERS: Oracle programs, including any operating
rem system, integrated software, any programs installed on the hardware,
rem and/or documentation, delivered to U.S. Government end users are
rem "commercial computer software" pursuant to the applicable Federal
rem Acquisition Regulation and agency-specific supplemental regulations.
rem As such, use, duplication, disclosure, modification, and adaptation
rem of the programs, including any operating system, integrated software,
rem any programs installed on the hardware, and/or documentation, shall be
rem subject to license terms and license restrictions applicable to the
rem programs. No other rights are granted to the U.S. Government.
rem This software or hardware is developed for general use in a variety
rem of information management applications. It is not developed or
rem intended for use in any inherently dangerous applications, including
rem applications that may create a risk of personal injury. If you use
rem this software or hardware in dangerous applications, then you shall
rem be responsible to take all appropriate fail-safe, backup, redundancy,
rem and other measures to ensure its safe use. Oracle Corporation and its
rem affiliates disclaim any liability for any damages caused by use of this
rem software or hardware in dangerous applications.
rem This software or hardware and documentation may provide access to or
rem information on content, products, and services from third parties.
rem Oracle Corporation and its affiliates are not responsible for and
rem expressly disclaim all warranties of any kind with respect to
rem third-party content, products, and services. Oracle Corporation and
rem its affiliates will not be responsible for any loss, costs, or damages
rem incurred due to your access to or use of third-party content, products,
rem or services.

setlocal

set DATA_RS_NAME=@@PROJECT_NAME@@-data
set DATA_FILE_NAME=rs_baseline_data.xml.gz
set DIMVALS_RS_NAME=@@PROJECT_NAME@@-dimvals
set DIMVALS_FILE_NAME=rs_baseline_dimvals.xml.gz
set CAS_ROOT=@@CAS_ROOT@@
set CAS_HOST=localhost
set CAS_PORT=@@CAS_PORT@@

call %~dp0..\config\script\set_environment.bat

if EXIST %CAS_ROOT% GOTO HASCASROOT
echo No CAS install folder was found at '%CAS_ROOT%'. Please install CAS.
endlocal
exit /B 1

:HASCASROOT
echo Using CAS install at %CAS_ROOT%
echo Loading %~dp0..\test_data\baseline\%DATA_FILE_NAME% into %DATA_RS_NAME%
call %CAS_ROOT%\bin\recordstore-cmd.bat write -b -a %DATA_RS_NAME% -h %CAS_HOST% -p %CAS_PORT% -f %~dp0..\test_data\baseline\%DATA_FILE_NAME%

echo Loading %~dp0..\test_data\baseline\%DIMVALS_FILE_NAME% into %DIMVALS_RS_NAME%
call %CAS_ROOT%\bin\recordstore-cmd.bat write -b -a %DIMVALS_RS_NAME% -h %CAS_HOST% -p %CAS_PORT% -f %~dp0..\test_data\baseline\%DIMVALS_FILE_NAME%

endlocal
exit /B 0
