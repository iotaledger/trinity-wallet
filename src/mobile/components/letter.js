import React from 'react'
import { Text } from 'react-native'

export const Letter = (props) => {
  const { children, spacing, textStyle } = props

  const letterStyles = [
    textStyle,
    { paddingRight: spacing }
  ]

  return <Text style={letterStyles}>{children}</Text>
}
