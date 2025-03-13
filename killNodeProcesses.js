const { execSync } = require('child_process');

try {
  console.log('Finding processes using port 3000...');
  
  // For Linux/Mac
  try {
    const pidCommand = 'lsof -i :3000 -t';
    const pids = execSync(pidCommand).toString().trim().split('\n');
    
    if (pids.length > 0 && pids[0] !== '') {
      console.log(`Found ${pids.length} process(es) using port 3000`);
      
      pids.forEach(pid => {
        if (pid && pid.trim()) {
          console.log(`Killing process ${pid}...`);
          execSync(`kill -9 ${pid}`);
        }
      });
      
      console.log('All processes killed successfully');
    } else {
      console.log('No processes found using port 3000');
    }
  } catch (error) {
    if (error.message.includes('Command failed')) {
      console.log('No processes found using port 3000');
    } else {
      throw error;
    }
  }
  
  // For Windows (in case it's needed)
  try {
    const windowsCommand = 'netstat -ano | findstr :3000';
    const output = execSync(windowsCommand).toString();
    const lines = output.trim().split('\n');
    
    if (lines.length > 0 && lines[0] !== '') {
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          pids.add(parts[4]);
        }
      });
      
      if (pids.size > 0) {
        console.log(`Found ${pids.size} process(es) using port 3000 on Windows`);
        pids.forEach(pid => {
          console.log(`Killing process ${pid}...`);
          execSync(`taskkill /F /PID ${pid}`);
        });
        console.log('All Windows processes killed successfully');
      }
    }
  } catch (error) {
    // Ignore errors on Windows commands if running on Linux/Mac
    if (!error.message.includes('Command failed')) {
      console.log('No Windows processes found or not running on Windows');
    }
  }
  
} catch (error) {
  console.error('Error:', error.message);
} 