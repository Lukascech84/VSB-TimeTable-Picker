export async function copyPickScript(selectedEntries, allEntries, timetableData) {
  const selectedIds = [];
  for (const entryKey of selectedEntries) {
    const entry = allEntries.find(e => 
      `${e.day}//${e.startTime}//${e.abbreviation}//${e.isLecture}//${e.teacher}//${e.educationWeekTitle}` === entryKey
    );
    
    if (entry && entry.activityId) {
      selectedIds.push(entry.activityId);
    }
  }

  const script = `(async function() {
    const idsToSelect = ${JSON.stringify(selectedIds)};
    const selectFuncName = Object.keys(window).find(k => k.endsWith('_selectConcreteActivity'));
    const refreshFuncName = Object.keys(window).find(k => k.endsWith('_refresh'));

    if (!selectFuncName || typeof window[selectFuncName] !== 'function') {
      alert('Chyba: Nepodařilo se najít výběrovou funkci Edisonu.');
      return;
    }

    async function executeImport() {
      console.log('%c[Rozvrh Picker] Zahajuji kobercový nálet...', 'color: #4ade80; font-weight: bold');
      
      // --- ÚVODNÍ REFRESH ---
      if (refreshFuncName && typeof window[refreshFuncName] === 'function') {
         console.log('[Rozvrh Picker] Provádím úvodní AJAX refresh pro probuzení serveru...');
         window[refreshFuncName]();
         
         // Dáme serveru 2 sekundy na zpracování refreshu, než na něj pošleme požadavky
         await new Promise(r => setTimeout(r, 2000));
      } else {
         console.warn('[Rozvrh Picker] Funkce pro refresh nenalezena, pokračuji bez něj.');
      }
      
      const maxWaves = 3;

      for (let wave = 1; wave <= maxWaves; wave++) {
        console.log('%c--- Vlna ' + wave + '/' + maxWaves + ' ---', 'color: #38bdf8');
        
        for (let i = 0; i < idsToSelect.length; i++) {
          const id = idsToSelect[i];
          window[selectFuncName](id); // Odeslání požadavku
          
          await new Promise(r => setTimeout(r, 400)); // Ochrana proti spamu
        }

        if (wave < maxWaves) {
          console.log('Čekám 2.5 sekundy pro případ opožděného serveru...');
          await new Promise(r => setTimeout(r, 2500));
        }
      }

      console.log('%c[Rozvrh Picker] Všechny vlny dokončeny!', 'color: #4ade80; font-weight: bold');
      
      // Závěrečný refresh pro zobrazení výsledků
      if (refreshFuncName && typeof window[refreshFuncName] === 'function') {
         setTimeout(() => window[refreshFuncName](), 1000);
      } else {
         setTimeout(() => window.location.reload(), 1000);
      }
    }

    // SNIPER MÓD
    const timeInput = prompt(
      "Režim SNIPER (Kobercový nálet):\\nZadej čas spuštění (např. 09:30:00).\\n\\nSkript nejprve provede refresh a pak pošle požadavky 3x za sebou.", 
      "09:30:00"
    );
    
    if (timeInput && timeInput.trim() !== '') {
      const now = new Date();
      const [hours, minutes, seconds] = timeInput.split(':').map(Number);
      const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, seconds || 0);
      
      let waitTime = targetTime.getTime() - now.getTime();
      
      if (waitTime > 0) {
        console.log('%c[Rozvrh Picker] Sniper aktivován!', 'color: #f59e0b; font-weight: bold');
        console.log('Spuštění v ' + targetTime.toLocaleTimeString() + ' (za ' + Math.round(waitTime/1000) + ' s).');
        console.log('%c⚠️ DŮLEŽITÉ: Nech tuto záložku aktivní, jinak prohlížeč odpočítávání uspí!', 'color: #ef4444; font-weight: bold');
        
        setTimeout(executeImport, waitTime);
      } else {
        executeImport();
      }
    } else {
      executeImport();
    }
  })();`;

  try {
    await navigator.clipboard.writeText(script);
    return true;
  } catch (err) {
    console.error('Chyba při kopírování:', err);
    const textArea = document.createElement('textarea');
    textArea.value = script;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
}
