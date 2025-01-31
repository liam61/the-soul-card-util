// ==UserScript==
// @name         小丑牌 Balatro 卡牌定位工具
// @namespace    balatro-soul-util
// @version      0.0.4
// @description  The Soul 的搜索增强版，帮助快速定位目标牌和位置。内置 蓝图、头脑、可乐的搜索，其他自行调用函数找到 `window.findCardInAnte(底注, 英文牌名)`
// @author       liam61
// @match        mathisfun0.github.io/The-Soul/
// @license MIT

// @downloadURL https://update.greasyfork.org/scripts/525121/%E5%B0%8F%E4%B8%91%E7%89%8C%20Balatro%20%E5%8D%A1%E7%89%8C%E5%AE%9A%E4%BD%8D%E5%B7%A5%E5%85%B7.user.js
// @updateURL https://update.greasyfork.org/scripts/525121/%E5%B0%8F%E4%B8%91%E7%89%8C%20Balatro%20%E5%8D%A1%E7%89%8C%E5%AE%9A%E4%BD%8D%E5%B7%A5%E5%85%B7.meta.js
// ==/UserScript==

;(function (global) {
  /**
   *
   * @param {number} ante 底注
   * @param {string | string[]} targets 目标牌，可以是单张牌，也可以是多张牌数组
   * @param {object} config
   * @param {'order' | 'card'} config.orderType 排序方式，order: 按照位置顺序，card: 按照牌的顺序
   * @param {'FlushFive' | 'HighCard'} config.preset 预设的牌组，FlushFive: 同花五条流，HighCard: 高牌流
   * @param {2 | 3 | 4} config.stockSize 牌库大小，默认 3
   */
  const findCardsInAnte = (ante, targets = [], config) => {
    if (typeof ante !== 'number') {
      console.error('[ante error]: should be a number')
      alert('[ante error]: 底注应该是一个数字')
    }

    if (!(Array.isArray(targets) || typeof targets === 'string' || targets == null)) {
      console.error('[targets error]: should be an array or string')
      alert('[targets error]: 目标牌应该是一个数组或字符串')
    }

    if (!(typeof config === 'object' || config == null)) {
      console.error('[config error]: should be an object')
      alert('[config error]: 配置选项应该是一个对象')
    }

    const { orderType = 'order', preset = 'FlushFive', stockSize = 3 } = config || {}
    const presetCardsMap = {
      FlushFive: ['Blueprint', 'Brainstorm', 'Diet Cola', 'Showman', 'The Idol', 'Sock and'],
      同花五条流: ['Blueprint', 'Brainstorm', 'Diet Cola', 'Showman', 'The Idol', 'Sock and'],
      // Juggler, Troubadour

      HighCard: ['Blueprint', 'Brainstorm', 'Diet Cola', 'Showman', 'Baron', 'Mime'],
      高牌流: ['Blueprint', 'Brainstorm', 'Diet Cola', 'Showman', 'Baron', 'Mime'],
    }

    // ==Utils==
    const findIndexOfCard = (ante, target) => {
      if (typeof target !== 'string') return []

      const anteEl = document.querySelector('#scrollingContainer').children[ante - 1]
      if (!anteEl) return []

      const cardListEl = anteEl.querySelector('.scrollable')

      const arr = [...cardListEl.children].reduce((arr, card, index) => {
        const el = card.querySelector('div')

        if (el.textContent.includes(target)) {
          arr.push({ card: target, index })
        }
        return arr
      }, [])

      return arr
    }

    const print = (targetCardList) => {
      const msgArr = targetCardList.map(({ card, index }) => {
        const realIndex = index + 1
        const order = realIndex % stockSize

        return `[ante ${ante}] ${card}   \tindex: ${realIndex}, round: ${Math.ceil(
          realIndex / stockSize
        )}, order: ${order != 0 ? order : stockSize}`
      })

      if (targetCardList.length) {
        console.log(msgArr.join('\n'))
        console.log('\n')
      }
    }
    // ==/Utils==

    // ==Output==
    const finalTargets = targets?.length
      ? Array.isArray(targets)
        ? targets
        : [targets]
      : presetCardsMap[preset]
    const targetLists = finalTargets.map((target) => findIndexOfCard(ante, target))

    if (orderType === 'card') {
      targetLists.sort((list1, list2) => list1[0]?.index - list2[0]?.index).forEach(print)
    } else if (orderType === 'order') {
      const orderedList = targetLists
        .reduce((arr, item) => {
          arr.push(...item)
          return arr
        }, [])
        .sort((item1, item2) => item1.index - item2.index)

      print(orderedList)
    }
  }
  // ==/Output==

  // ==Export==
  const maxAnte = 40

  global.findCardsInAnte = findCardsInAnte
  global.findCardsInAllAntes = (targets, config) => {
    return Array.from({ length: maxAnte }, (_, i) => i + 1).map((ante) =>
      findCardsInAnte(ante, targets, config)
    )
  }

  // ==/Export==

  global.findCardsInAllAntes()
})(window)
