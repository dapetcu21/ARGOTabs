require('./components')
require('./editable-table')
require('./common.styl')

class UIComponents {
  angularModules () {
    return ['components', 'editable-table']
  }
}

module.exports = UIComponents
