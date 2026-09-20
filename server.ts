import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { analyzeReportWithGemini } from './server/gemini';
import { store } from './server/store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing with elevated limit for image uploads
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // ==================== API ROUTES ====================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'CivicPulse AI Incident Intelligence Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // AI Multimodal Report Analysis (Gemini API)
  app.post('/api/ai/analyze-report', async (req, res) => {
    try {
      const { description, imageBase64, imageMimeType, categoryHint } = req.body;

      if (!description && !imageBase64) {
        return res.status(400).json({ error: 'Either description or imageBase64 is required.' });
      }

      const analysis = await analyzeReportWithGemini(
        description || '',
        imageBase64,
        imageMimeType || 'image/jpeg',
        categoryHint
      );

      res.json({ success: true, analysis });
    } catch (error: any) {
      console.error('[API] AI analysis failed:', error);
      res.status(500).json({ error: 'AI analysis encountered an error.', details: error.message });
    }
  });

  // Get all incidents
  app.get('/api/incidents', (req, res) => {
    try {
      const incidents = store.getIncidents();
      res.json(incidents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single incident by ID
  app.get('/api/incidents/:id', (req, res) => {
    try {
      const incident = store.getIncidentById(req.params.id);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found' });
      }
      res.json(incident);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update incident (admin status change, public warning broadcast)
  app.patch('/api/incidents/:id', (req, res) => {
    try {
      const updated = store.updateIncident(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Incident not found' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Merge duplicate incidents
  app.post('/api/incidents/merge', (req, res) => {
    try {
      const { primaryIncidentId, secondaryIncidentId } = req.body;
      if (!primaryIncidentId || !secondaryIncidentId) {
        return res.status(400).json({ error: 'primaryIncidentId and secondaryIncidentId are required' });
      }
      const merged = store.mergeIncidents(primaryIncidentId, secondaryIncidentId);
      if (!merged) {
        return res.status(400).json({ error: 'Could not merge incidents. Check incident IDs.' });
      }
      res.json({ success: true, mergedIncident: merged });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all reports
  app.get('/api/reports', (req, res) => {
    try {
      const reports = store.getReports();
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dismiss report
  app.post('/api/reports/:id/dismiss', (req, res) => {
    try {
      const success = store.dismissReport(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json({ success: true, message: 'Report dismissed' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Submit new citizen report (triggers clustering & emerging engine)
  app.post('/api/reports', (req, res) => {
    try {
      const {
        description,
        imageUrl,
        latitude,
        longitude,
        locationName,
        category,
        subtype,
        aiSummary,
        aiConfidence,
        severity,
        tags,
        userName,
      } = req.body;

      if (!description || latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Missing required report fields (description, latitude, longitude).' });
      }

      const result = store.addReport({
        userId: `user-${Math.floor(100 + Math.random() * 900)}`,
        userName: userName || 'Civic Observer',
        description,
        imageUrl,
        latitude: Number(latitude),
        longitude: Number(longitude),
        locationName: locationName || 'Reported Location',
        timestamp: new Date().toISOString(),
        category: category || 'INFRASTRUCTURE DAMAGE',
        subtype: subtype || 'general issue',
        aiSummary: aiSummary || description,
        aiConfidence: Number(aiConfidence) || 90,
        severity: (Number(severity) || 3) as any,
        tags: Array.isArray(tags) ? tags : ['citizen-report'],
      });

      res.status(201).json({
        success: true,
        report: result.report,
        incident: result.incident,
        isNewCluster: result.isNewCluster,
        matchedReason: result.matchedReason,
      });
    } catch (error: any) {
      console.error('[API] Error creating report:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Reset to Seed Demo Data
  app.post('/api/demo/seed', (req, res) => {
    try {
      const counts = store.resetToSeed();
      res.json({
        success: true,
        message: 'Demo dataset successfully loaded into CivicPulse AI intelligence store.',
        ...counts,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics endpoint
  app.get('/api/analytics', (req, res) => {
    try {
      const analytics = store.getAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== VITE MIDDLEWARE ====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CivicPulse AI] Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CivicPulse AI] Failed to start server:', err);
  process.exit(1);
});
