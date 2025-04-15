import { Action, Reducer } from 'umi';
export default {
  state: {
    list: [{ "111": "银牌伙伴\n", "222": " 银牌合作伙伴 \n", "name": "澎峰科技", "logo": "http://10.12.110.200:8080/dolphin/weekly_report/1690508241.65481_企业微信截图_20230728093712.png", "established_at": "2016", "staff_count": "30+", "operation": "核心团队来自中科院，目前已经在北京、长沙和青岛建立公司和研发中心", "security": "自主研发、自主可控", "product_ability": "1. 异构计算软件栈PerfXAPI\nPerfXAPI为构建计算硬件平台集成了所有必要的行业标准技术，并充分发挥最新处理器和加速器的性能。支持的技术包括PerfMPL、oneAPI、OpenCL、SYCL、ONNX runtime、OpenCV等。\n2. 高性能计算库PerfMPL\nPerfMPL主要包含BLAS、FFT、IPP、MATH等关键数学计算库和深度学习算子库，并广泛适配ARM、RISC-V、x86 CPU处理器， 为NPU、GPU、DPU等加速卡硬件构建和优化核心计算库组件。\n3. 新一代科学计算工具PerfXPy\nPerfXPy是面向数据科学家的高性能异构Python计算平台。\n4. HPC软硬件融合解决方案\n通过公司自主研发的计算软件栈全栈技术（PerfXAPI、PerfMPL、PerfXPy等），加速异构计算硬件赋能科学计算与AI计算应用等场景，实现加速计算、绿色计算和计算中国创新的革命", "technology_ability": "致力于计算软件栈技术领域的技术研发，在高性能计算领域有着上十年的技术沉淀\n", "interface_user": "", "current_state": "Done", "cooperation_priority": "High", "id": "1690508326719", "contact_time": "2023-05-28", "service_ability": "加速计算机技术解决方案商，同时致力于算力基础软件研发\n", "industry_advantage": "聚集HPC、AI、RISC-V三大领域\n", "cologic_advantage": "华为、燧原、海光飞腾、阿里平头哥、沐曦集成电路、芯来科技、开放原子开源基金会、ARM、PARATERA、北京大学、中科院计算所、青岛大学、北京理工大学等\n", "ability_level": "加速库\n", "cooperation_count": "2", "cooperation_type": "委托开发\n", "cooperation_pattern": "联合开发\n", "cooperation_sample": "Libra\n", "contract_management": "NDA,战略合作协议\n" }, { "111": "80\n", "222": "金牌合作伙伴 \n", "name": "卡姆派乐", "logo": "http://10.12.110.200:8080/dolphin/weekly_report/1690510214.595739_企业微信截图_20230728100427.png", "established_at": "2019", "staff_count": "50+", "operation": "核心成员来源于国防科大团队，有国防科大微电子所、IBM、华为等科 研单位及公司就业经历，硕士研究生及以上学历占比80%以上\n", "product_ability": "1.客户芯片基础软件定制服务\n2.卡姆派乐ARM—IDE的研发和应用推广\n3.卡姆派乐调试仿真器的研发和推广\n4..编译器测试、性能分析工具的开发\n5.卡姆派乐RISC-V—IDE的研发和应用推广\"\n", "service_ability": "专注于芯片基础软件并且具备全套工具链开发能力的信息技术企业，主要提供芯片集成开发环境、编译器、链接器、调试器、二进制翻译、高性能数学库、AI算子优化等服务。\n", "cologic_advantage": "飞腾、兆易创新、芯来科技、华为、平头哥、中兴、君正、芯来等\n", "ability_level": "软件服务,编译器\n", "current_state": "On-Going", "cooperation_priority": "High", "contact_time": "2023-07-28", "cooperation_count": "1", "cooperation_type": "适配认证,联合解决方案\n", "cooperation_pattern": "项目合作,联合开发\n", "cooperation_sample": "点军区项目,成都项目\n", "contract_management": "NDA,战略合作协议\n", "id": "1690510294640" }],
    execFlow: []
  },
  effects: {

  },
  reducers: {
    setList(state: any, { payload = {} }): Reducer {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
