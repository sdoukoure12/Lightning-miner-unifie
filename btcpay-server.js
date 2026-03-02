const axios = require('axios');

class BTCPayServerIntegration {
  constructor(config) {
    this.apiUrl = config.btcpayUrl;
    this.apiKey = config.apiKey;
    this.storeId = config.storeId;
  }

  async createInvoice(amount, orderId, notificationUrl) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/api/v1/stores/${this.storeId}/invoices`,
        {
          amount: amount,
          currency: 'BTC',
          orderId: orderId,
          notificationUrl: notificationUrl,
          extendedNotifications: true,
          paymentMethods: ['BTC_LightningNetwork']
        },
        {
          headers: {
            'Authorization': `token ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating BTCPay invoice:', error.message);
      throw error;
    }
  }

  async getInvoiceStatus(invoiceId) {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/v1/stores/${this.storeId}/invoices/${invoiceId}`,
        {
          headers: {
            'Authorization': `token ${this.apiKey}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice status:', error.message);
      throw error;
    }
  }

  verifyWebhook(body, signature) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', this.apiKey);
    hmac.update(JSON.stringify(body));
    const computedSignature = hmac.digest('hex');
    return computedSignature === signature;
  }

  async handlePaymentConfirmation(webhookData) {
    if (webhookData.type === 'InvoiceSettled') {
      return {
        status: 'confirmed',
        invoiceId: webhookData.invoiceId,
        amount: webhookData.amount,
        paymentMethod: webhookData.paymentMethod,
        timestamp: new Date()
      };
    }
    return null;
  }
}

module.exports = BTCPayServerIntegration;