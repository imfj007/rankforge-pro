import { useState } from 'react';
import { Search, Download, Copy, AlertTriangle, CheckCircle, XCircle, ExternalLink, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { runSeoAudit } from '../utils/api';
import { addToHistory, copyToClipboard, getScoreColor, getScoreLabel } from '../utils/helpers';
import ScoreCircle from './ScoreCircle';
import LoadingSkeleton from './LoadingSkeleton';
import { jsPDF } from 'jspdf';

export default function SeoAuditTab({ checkAccess }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return toast.error('Please enter a URL');
    if (!checkAccess()) return;

    setLoading(true);
    setResult(null);

    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
      
      const data = await runSeoAudit(targetUrl);
      setResult(data);
      addToHistory('seo-audit', targetUrl, data);
      toast.success('SEO audit complete!');
    } catch (err) {
      toast.error(err.message || 'Audit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    copyToClipboard(JSON.stringify(result, null, 2));
    toast.success('Results copied!');
  };

  const handleExportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('RankForge Pro - SEO Audit Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`URL: ${url}`, 14, 35);
    doc.text(`Score: ${result.score}/100 (${getScoreLabel(result.score)})`, 14, 45);
    doc.text(`Title: ${result.title || 'N/A'}`, 14, 55);
    doc.text(`Meta Description: ${result.metaDescription || 'N/A'}`, 14, 65);
    doc.text(`H1: ${result.h1 || 'N/A'}`, 14, 75);
    doc.text(`Word Count: ${result.wordCount || 0}`, 14, 85);
    doc.text(`HTTPS: ${result.https ? 'Yes' : 'No'}`, 14, 95);
    doc.text(`Mobile Ready: ${result.mobileReady ? 'Yes' : 'No'}`, 14, 105);

    if (result.issues && result.issues.length > 0) {
      doc.text('Issues Found:', 14, 120);
      result.issues.forEach((issue, i) => {
        if (130 + i * 10 < 280) {
          doc.text(`  ${issue.priority}: ${issue.issue}`, 14, 130 + i * 10);
        }
      });
    }

    doc.save(`seo-audit-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF exported!');
  };

  const getPriorityClass = (priority) => {
    const map = { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
    return map[priority] || 'badge-low';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          <span className="text-gradient">SEO Audit</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }} className="mt-1 text-sm">
          Enter any URL to get a comprehensive AI-powered SEO analysis
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleAudit} className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" 
            style={{ color: 'var(--color-text-dim)' }} />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to audit (e.g., example.com)"
            className="input-primary pl-11"
            id="seo-audit-url-input"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading} id="seo-audit-submit">
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            <>
              <Search size={16} /> Audit
            </>
          )}
        </button>
      </form>

      {/* Loading State */}
      {loading && <LoadingSkeleton type="audit" />}

      {/* Results */}
      {result && !result.parseError && (
        <div className="space-y-6 animate-slide-up">
          {/* Action buttons */}
          <div className="flex gap-3 justify-end">
            <button onClick={handleCopy} className="btn-secondary text-sm">
              <Copy size={14} /> Copy JSON
            </button>
            <button onClick={handleExportPDF} className="btn-secondary text-sm">
              <Download size={14} /> Export PDF
            </button>
          </div>

          {/* Score + Summary */}
          <div className="card-static grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center">
              <ScoreCircle score={result.score || 0} size={160} />
              <p className="mt-3 text-sm font-semibold" style={{ 
                color: getScoreColor(result.score || 0),
                fontFamily: 'var(--font-heading)' 
              }}>
                {getScoreLabel(result.score || 0)}
              </p>
            </div>
            <div className="col-span-2 space-y-4">
              <h3 className="font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                Summary
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {result.summary}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickStat label="HTTPS" value={result.https ? 'Yes' : 'No'} good={result.https} />
                <QuickStat label="Mobile" value={result.mobileReady ? 'Ready' : 'No'} good={result.mobileReady} />
                <QuickStat label="Schema" value={result.schemaMarkup || 'N/A'} good={result.schemaMarkup === 'present'} />
                <QuickStat label="Canonical" value={result.canonicalTag || 'N/A'} good={result.canonicalTag === 'present'} />
              </div>
            </div>
          </div>

          {/* Page Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-static space-y-3">
              <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                Page Details
              </h3>
              <DetailRow label="Title" value={result.title} />
              <DetailRow label="H1" value={result.h1} />
              <DetailRow label="Meta Description" value={result.metaDescriptionText || result.metaDescription} />
              <DetailRow label="Word Count" value={result.wordCount} />
              <DetailRow label="Load Speed" value={result.loadSpeed} />
              <DetailRow label="Image Alt Tags" value={result.imageAltTags} />
            </div>

            <div className="card-static space-y-3">
              <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                Link Analysis
              </h3>
              <DetailRow label="Internal Links" value={result.internalLinks} />
              <DetailRow label="External Links" value={result.externalLinks} />
              {result.h2s && result.h2s.length > 0 && (
                <div>
                  <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>H2 Headings</span>
                  <div className="mt-1 space-y-1">
                    {result.h2s.map((h2, i) => (
                      <div key={i} className="text-xs px-2 py-1 rounded" 
                        style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}>
                        {h2}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Issues */}
          {result.issues && result.issues.length > 0 && (
            <div className="card-static space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2" 
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                <AlertTriangle size={16} /> Issues Found ({result.issues.length})
              </h3>
              <div className="space-y-3">
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg"
                    style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                    <span className={`chip text-xs flex-shrink-0 ${getPriorityClass(issue.priority)}`}>
                      {issue.priority}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {issue.issue}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>
                        💡 {issue.fix}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {result.keywords && result.keywords.length > 0 && (
            <div className="card-static space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                <Tag size={16} /> Detected Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((kw, i) => (
                  <span key={i} className="chip chip-purple">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="card-static space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-success)' }}>
                <CheckCircle size={16} /> Recommendations
              </h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-success)' }}>→</span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuickStat({ label, value, good }) {
  return (
    <div className="p-3 rounded-lg text-center"
      style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
      <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{label}</div>
      <div className="text-sm font-semibold mt-1 flex items-center justify-center gap-1">
        {good ? (
          <CheckCircle size={12} style={{ color: 'var(--color-success)' }} />
        ) : (
          <XCircle size={12} style={{ color: 'var(--color-error)' }} />
        )}
        <span style={{ color: good ? 'var(--color-success)' : 'var(--color-error)' }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1 border-b" 
      style={{ borderColor: 'var(--color-border)' }}>
      <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{label}</span>
      <span className="text-xs font-medium max-w-[60%] text-right truncate" 
        style={{ color: 'var(--color-text-primary)' }}>
        {value || 'N/A'}
      </span>
    </div>
  );
}
