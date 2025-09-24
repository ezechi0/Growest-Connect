// Utilitaire pour générer les reçus HTML
export function generateReceiptHtml(transaction: any): string {
  const date = new Date(transaction.created_at).toLocaleDateString('fr-FR');
  const amount = Number(transaction.amount).toLocaleString('fr-FR');
  const commission = Number(transaction.commission_amount || 0).toLocaleString('fr-FR');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Reçu de paiement</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #10B981; }
        .receipt-title { font-size: 20px; margin: 20px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
        .info-item { margin-bottom: 10px; }
        .label { font-weight: bold; color: #666; }
        .value { margin-top: 5px; }
        .total { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
        .divider { border-top: 2px solid #e5e5e5; margin: 30px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">GROWEST CONNECT</div>
        <div class="receipt-title">REÇU DE PAIEMENT</div>
        <div style="color: #666;">N° ${transaction.receipt_number}</div>
      </div>

      <div class="info-grid">
        <div>
          <div class="info-item">
            <div class="label">Date de transaction</div>
            <div class="value">${date}</div>
          </div>
          <div class="info-item">
            <div class="label">Référence Paystack</div>
            <div class="value">${transaction.paystack_reference}</div>
          </div>
          <div class="info-item">
            <div class="label">Type de transaction</div>
            <div class="value">${transaction.transaction_type === 'investment' ? 'Investissement' : 'Abonnement'}</div>
          </div>
        </div>
        <div>
          <div class="info-item">
            <div class="label">Investisseur</div>
            <div class="value">${transaction.profiles?.full_name || 'Non disponible'}</div>
          </div>
          <div class="info-item">
            <div class="label">Projet</div>
            <div class="value">${transaction.projects?.title || 'Non disponible'}</div>
          </div>
          <div class="info-item">
            <div class="label">Méthode de paiement</div>
            <div class="value">${transaction.payment_method === 'mobile_money' ? 'Mobile Money' : 'Carte bancaire'}</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="total">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Montant de l'investissement</span>
          <span>${amount} ${transaction.currency || 'XOF'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #666;">
          <span>Commission plateforme (5%)</span>
          <span>${commission} ${transaction.currency || 'XOF'}</span>
        </div>
        <div style="border-top: 1px solid #ddd; padding-top: 10px; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
          <span>Total payé</span>
          <span>${amount} ${transaction.currency || 'XOF'}</span>
        </div>
      </div>

      <div class="footer">
        <p>Merci de votre confiance en Growest Connect</p>
        <p>Ce reçu confirme votre investissement et fait foi de paiement.</p>
        <p>Pour toute question: support@growestconnect.com</p>
      </div>
    </body>
    </html>
  `;
}