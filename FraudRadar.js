const fs = require('fs')
const path = require('path')

class FraudRadar {
  constructor (fileDir = './files', fileExt = 'txt') {
    this.fileDir = fileDir
    this.fileExt = fileExt
  }

  readFile (filePath) {
    let fileContent = fs.readFileSync(filePath, 'utf8')
    let lines = fileContent.split('\n')
    return lines.map(l => {
      const items = l.split(',')
      return {
        orderId: parseInt(items[0]),
        dealId: parseInt(items[1]),
        email: items[2].toLowerCase(),
        street: items[3].toLowerCase(),
        city: items[4].toLowerCase(),
        state: items[5].toLowerCase(),
        zipCode: items[6],
        creditCard: items[7]
      }
    })
  }

  normalizeOrders (orders) {
    return orders.map(order => {
      // Normalize email
      let aux = order.email.split('@')
      let atIndex = aux[0].indexOf('+')
      aux[0] =
        atIndex < 0
          ? aux[0].replace('.', '')
          : aux[0].replace('.', '').substring(0, atIndex - 1)
      order.email = aux.join('@')

      // Normalize street
      order.street = order.street
        .replace('st.', 'street')
        .replace('rd.', 'road')

      // Normalize state
      order.state = order.street
        .replace('il', 'illinois')
        .replace('ca', 'california')
        .replace('ny', 'new york')
      return order
    })
  }

  isEmailFraud (order, orderToCompareTo) {
    return (
      order.dealId === orderToCompareTo.dealId &&
      order.email === orderToCompareTo.email &&
      order.creditCard !== orderToCompareTo.creditCard
    )
  }

  isAddressFraud (order, orderToCompareTo) {
    return (
      order.dealId === orderToCompareTo.dealId &&
      order.state === orderToCompareTo.state &&
      order.zipCode === orderToCompareTo.zipCode &&
      order.street === orderToCompareTo.street &&
      order.city === orderToCompareTo.city &&
      order.creditCard !== orderToCompareTo.creditCard
    )
  }

  Check (filePath) {
    const orders = this.readFile(filePath)
    this.normalizeOrders(orders)
    const frauds = []
    let order = orders.shift()
    while (orders.length > 0) {
      const fraudulentOrder = orders.find(
        orderToCompareTo =>
          this.isEmailFraud(order, orderToCompareTo) ||
          this.isAddressFraud(order, orderToCompareTo)
      )
      if (fraudulentOrder) frauds.push(fraudulentOrder)
      order = orders.shift()
    }
    return frauds
  }
}

module.exports = { FraudRadar }
