let parseRules = rules => {
  rules = rules.map(rule => {
    let tmpRule = '{'
    rule = rule.split('&')
    rule.forEach((cond, i) => {
      cond = cond.replace(/"/g, '\\\"');
      let [key, value] = cond.trim().split(':')
      if (key) key = key.trim().toLowerCase()
      if (value) value = value.trim().toLowerCase()
      tmpRule += '"' +key+ '":"' +value+ '"'
      if (i != rule.length-1) tmpRule += ','
    })
    tmpRule+='}'
    tmpRule = JSON.parse(tmpRule)
    return tmpRule
  })
  return rules
}


export default parseRules