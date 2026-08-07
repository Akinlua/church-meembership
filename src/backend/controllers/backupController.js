const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const getDatabaseUrl = () => {
    return process.env.DATABASE_URL;
};

exports.downloadBackup = async (req, res) => {
    try {
        const dbUrl = getDatabaseUrl();
        if (!dbUrl) {
            return res.status(500).json({ message: 'DATABASE_URL not found in environment variables.' });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backup-${timestamp}.sql`;
        const backupFilePath = path.join(__dirname, '..', 'public', 'uploads', backupFileName);

        // Ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Run pg_dump command
        const command = `pg_dump --clean --if-exists --no-owner --no-privileges -d "${dbUrl}" -f "${backupFilePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Backup error: ${error.message}`);
                return res.status(500).json({ message: 'Failed to generate backup.', error: error.message });
            }

            res.download(backupFilePath, backupFileName, (err) => {
                if (err) {
                    console.error(`Download error: ${err.message}`);
                }
                // Clean up file after download
                fs.unlink(backupFilePath, (unlinkErr) => {
                    if (unlinkErr) console.error(`Failed to delete temporary backup file: ${unlinkErr}`);
                });
            });
        });

    } catch (error) {
        console.error('Download Backup Error:', error);
        res.status(500).json({ message: 'Server error during backup.', error: error.message });
    }
};

exports.restoreBackup = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No backup file uploaded.' });
        }

        const dbUrl = getDatabaseUrl();
        if (!dbUrl) {
            return res.status(500).json({ message: 'DATABASE_URL not found in environment variables.' });
        }

        const backupFilePath = req.file.path;

        // Run psql command to restore the file
        // psql -f file.sql URL
        const command = `psql -d "${dbUrl}" -f "${backupFilePath}"`;

        exec(command, (error, stdout, stderr) => {
            // Clean up the uploaded file
            fs.unlink(backupFilePath, (unlinkErr) => {
                if (unlinkErr) console.error(`Failed to delete uploaded backup file: ${unlinkErr}`);
            });

            if (error) {
                console.error(`Restore error: ${error.message}`);
                return res.status(500).json({ message: 'Failed to restore backup.', error: error.message });
            }

            res.json({ message: 'Backup restored successfully.' });
        });

    } catch (error) {
        console.error('Restore Backup Error:', error);
        res.status(500).json({ message: 'Server error during restore.', error: error.message });
    }
};
