import parse from 'graphql-tag'
import {print} from 'graphql-tag/printer'

let fragmentIdCounter = 0

export function gql(strings, ...fragments) {
  let fragmentsString = ''

  const fragmentsForParser = fragments.map(fragment => {
    if (!fragment.definitions[0].name.__isUnique) {
      fragment.definitions[0].name.value += '__' + (fragmentIdCounter++).toString()
      fragment.definitions[0].name.__isUnique = true
    }

    const name = fragment.definitions[0].name.value

    fragmentsString += print(fragment)

    return `\n...${name}\n`
  })

  let forParser = ''

  for (let i = 0; i < strings.length; i++) {
    forParser += strings[i]
    if (fragmentsForParser[i]) forParser += fragmentsForParser[i]
  }

  forParser += fragmentsString

  return parse([forParser])
}
