export default {
  getValueFromEvent:(e)=>{
    //return e.target.value.replace(/(^s*)|(s*$)/g, '');
    //return e.target.value.replace(/[, ]/g,'', '');
    return e.target.value.replace(/(^\s*)|(\s*$)/g, ""); // 首尾自动去掉空格


  }
}
