!macro customInstall
  DetailPrint "Adding Firewall rule for MediPro Local Server on port 3001..."
  ExecWait 'netsh advfirewall firewall add rule name="MediPro Local Server" dir=in action=allow protocol=TCP localport=3001'
!macroend

!macro customUnInstall
  DetailPrint "Removing Firewall rule for MediPro Local Server..."
  ExecWait 'netsh advfirewall firewall delete rule name="MediPro Local Server"'
!macroend
