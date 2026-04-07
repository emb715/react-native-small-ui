import { useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { createComponent } from 'react-native-small-ui';

type ASD<E extends React.ElementType> = ReturnType<typeof createComponent<E>>;

type PolymorphicProps<E extends React.ElementType> = {
  as?: E;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<ASD<E>>;

export const Button = <E extends React.ElementType>({
  as,
  children,
  ...props
}: PolymorphicProps<E>) => {
  const Component = as || TouchableOpacity;

  const CreatedComponent = createComponent(Component, props);

  return <CreatedComponent {...props}>{children}</CreatedComponent>;
};

export const Test = () => {
  const myRef = useRef();
  return <Button ref={myRef}>asd</Button>;
};

// import React, {
//   memo,
//   useMemo,
//   type ComponentProps,
//   type PropsWithChildren,
// } from 'react';
// import { Pressable, Text } from 'react-native';
// import {
//   createComponent,
//   getTheme,
//   useColorModeValue,
// } from 'react-native-small-ui';
// // import type { ComponentStyle } from '../../../src/smallUI';

// // interface LinkProps extends PropsWithChildren<ButtonBase> {
// //   href: string;
// //   target?: string;
// // }

// type LinkProps = PropsWithChildren<ComponentProps<typeof ButtonBase>> & {
//   href: string;
//   target?: string;
//   rel?: string;
//   customVariant: ReturnButtonVariant; // An object of custom styles that the base component can receive
// };
// // interface Link {
// //   (props: LinkProps): React.ReactNode;
// // }

// export const Link = ({
//   children,
//   href,
//   target,
//   rel,
//   customVariant,
//   ...buttonProps
// }: LinkProps) => {
//   console.log('LOG: Link > customVariant:', customVariant);
//   // const buttonVariantStyle = useColorModeValue(
//   //   ButtonVariants.light.link,
//   //   ButtonVariants.dark.link
//   // );
//   const customVariantStyle = useColorModeValue(
//     customVariant.light,
//     customVariant.dark
//   );
//   console.log('LOG: > customVariantStyle:', customVariantStyle);

//   // TODO: Links for native should onPress Linking.openUrl(href)

//   return (
//     <ButtonBase
//       {...buttonProps}
//       role="link"
//       // @ts-expect-error href is missing as prop on component but resolves for react native web
//       href={href}
//       rel={rel}
//       target={target}
//     >
//       {children}
//     </ButtonBase>
//   );
// };

// // function MyLink() {
// //   // <Link className={buttonVariants({ variant: "outline" })}>Click here</Link>
// //   return (
// //     <Link
// //       href="https://asd"
// //       customVariant={buttonVariants({ variant: 'outline' })}
// //     >
// //       asd
// //     </Link>
// //   );
// //   // return <Link href="https://asd">asd</Link>;
// // }

// // type ButtonBase = typeof ButtonBase;
// const ButtonBase = createComponent(Pressable, {
//   flexDirection: 'row',
//   justifyContent: 'center',
//   alignItems: 'center',
//   height: 36,
//   paddingVertical: 8,
//   paddingHorizontal: 16,
//   borderRadius: 6,
//   //
//   borderWidth: 1,
//   borderColor: 'transparent',
//   //
//   _web: {
//     userSelect: 'none',
//     textTransform: 'none',
//   },
// });
// const ButtonTextBase = createComponent(Text, {
//   //
//   fontSize: 14,
//   lineHeight: 18,
// });

// const theme = getTheme();

// const COLOR_VARIANTS = {
//   primary: 'primary',
//   secondary: 'secondary',
//   destructive: 'destructive',
//   outline: 'outline',
//   ghost: 'ghost',
//   link: 'link',
// };
// type ColorVariants = keyof typeof COLOR_VARIANTS;

// // interface ButtonVariant {
// //   (params: {
// //     variant: ColorVariants;
// //     // colorMode?: 'dark' | 'light';
// //   }): ReturnButtonVariant;
// // }

// type ReturnButtonVariant = {
//   light: Record<string, unknown>;
//   dark: Record<string, unknown>;
// };

// const buttonVariants = ({
//   variant = 'primary',
// }: {
//   variant: ColorVariants;
// }) => {
//   return {
//     light: ButtonVariants.light[variant],
//     dark: ButtonVariants.dark[variant],
//   };
// };
// console.log(
//   'LOG: > buttonVariants:ButtonVariant > buttonVariants:',
//   buttonVariants({ variant: 'outline' })
// );

// const rootStyles = {
//   '--background': theme.colors.light.background,
//   '--primary': theme.colors.light.primary,
//   '--primary-foreground': theme.colors.light.palette.primary[100],
//   '--secondary': theme.colors.light.secondary,
//   '--secondary-foreground': '#ffffff',
//   '--destructive': theme.colors.light.palette.primary[900],
//   '--destructive-foreground': theme.colors.light.palette.primary[100],
//   '--accent': theme.colors.light.accent,
//   '--accent-foreground': theme.utils.getContrastColor(
//     theme.colors.light.accent
//   ),
// };
// // const rootStylesDark = {
// //   '--background': theme.colors.dark.background,
// //   '--primary': theme.colors.dark.primary,
// //   '--primary-foreground': theme.colors.dark.palette.primary[100],
// //   '--secondary': theme.colors.dark.secondary,
// //   '--secondary-foreground': '#ffffff',
// //   '--destructive': theme.colors.dark.palette.primary[900],
// //   '--destructive-foreground': theme.colors.dark.palette.primary[100],
// //   '--accent': theme.colors.dark.accent,
// //   '--accent-foreground': theme.utils.getContrastColor(theme.colors.dark.accent),
// // };

// // --background: 240 10% 3.9%;
// // --foreground: 0 0% 98%;
// // --muted: 240 3.7% 15.9%;
// // --muted-foreground: 240 5% 64.9%;
// // --popover: 240 10% 3.9%;
// // --popover-foreground: 0 0% 98%;
// // --card: 240 10% 3.9%;
// // --card-foreground: 0 0% 98%;
// // --border: 240 3.7% 15.9%;
// // --input: 240 3.7% 15.9%;
// // --primary: 0 0% 98%;
// // --primary-foreground: 240 5.9% 10%;
// // --secondary: 240 3.7% 15.9%;
// // --secondary-foreground: 0 0% 98%;
// // --accent: 240 3.7% 15.9%;
// // --accent-foreground: 0 0% 98%;
// // --destructive: 0 62.8% 30.6%;
// // --destructive-foreground: 0 0% 98%;
// // --ring: 240 4.9% 83.9%;

// const TextVariants = {
//   light: {
//     primary: {
//       color:
//         rootStyles['--primary-foreground'] ??
//         theme.utils.getContrastColor(theme.colors.light.primary),
//     },
//     secondary: {
//       color: theme.utils.getContrastColor(theme.colors.light.secondary),
//     },
//     destructive: {
//       color: theme.utils.getContrastColor(
//         theme.colors.light.palette.primary[900]
//       ),
//     },
//     outline: {
//       color: theme.utils.getContrastColor(theme.colors.light.border),
//     },
//     ghost: {
//       color: theme.colors.light.foreground,
//     },
//     link: {
//       // TODO: add link styles
//       color: theme.colors.light.accent,
//     },
//   },
//   dark: {
//     primary: {
//       color: theme.utils.getContrastColor(theme.colors.dark.primary),
//     },
//     secondary: {
//       color: theme.utils.getContrastColor(theme.colors.dark.secondary),
//     },
//     destructive: {
//       color: theme.utils.getContrastColor(
//         theme.colors.dark.palette.primary[900]
//       ),
//     },
//     outline: {
//       color: theme.utils.getContrastColor(theme.colors.dark.border),
//     },
//     ghost: {
//       color: theme.colors.dark.foreground,
//     },
//     link: {
//       // TODO: add link styles
//       color: theme.colors.dark.accent,
//     },
//   },
// } as const;

// const ButtonVariants = {
//   light: {
//     primary: {
//       backgroundColor: theme.colors.light.primary,
//       $text: TextVariants.light.primary,
//     },
//     secondary: {
//       backgroundColor: theme.colors.light.secondary,
//       $text: TextVariants.light.secondary,
//     },
//     destructive: {
//       backgroundColor: theme.colors.light.palette.primary[900],
//       $text: TextVariants.light.destructive,
//     },
//     outline: {
//       borderWidth: 1,
//       borderColor: theme.colors.light.border,
//       backgroundColor: theme.colors.light.background,
//       $text: TextVariants.light.outline,
//     },
//     ghost: {
//       borderColor: 'transparent',
//       backgroundColor: 'transparent',
//       $text: TextVariants.light.ghost,
//     },
//     link: {
//       // TODO: add link styles
//       $text: TextVariants.light.link,
//     },
//   },
//   dark: {
//     primary: {
//       backgroundColor: theme.colors.dark.primary,
//       $text: TextVariants.dark.primary,
//     },
//     secondary: {
//       backgroundColor: theme.colors.dark.secondary,
//       $text: TextVariants.dark.secondary,
//     },
//     destructive: {
//       backgroundColor: theme.colors.dark.palette.primary[900],
//       $text: TextVariants.dark.destructive,
//     },
//     outline: {
//       borderWidth: 1,
//       borderColor: theme.colors.dark.border,
//       backgroundColor: theme.colors.dark.background,
//       $text: TextVariants.dark.outline,
//     },
//     ghost: {
//       borderColor: 'transparent',
//       backgroundColor: 'transparent',
//       $text: TextVariants.dark.ghost,
//     },
//     link: {
//       // TODO: add link styles
//       $text: TextVariants.dark.link,
//     },
//   },
// } as const;

// type VariantType = keyof (typeof ButtonVariants)['light'];

// const ButtonPresets = {
//   enabled: {
//     opacity: 1,
//   },
//   disabled: {
//     opacity: 0.7,
//   },
// } as const;

// type ButtonProps = Omit<ComponentProps<typeof ButtonBase>, 'children'> & {
//   variant?: VariantType;
//   disabled?: boolean;
//   asChild?: false;
//   children: React.ReactNode;
// };
// type ButtonAsLink<T = ButtonProps> = Omit<T, 'asChild' | 'children'> & {
//   asChild: true;
//   children: React.ReactElement<typeof Link>;
// };

// const ButtonComponent = (props: ButtonProps | ButtonAsLink<ButtonProps>) => {
//   const {
//     variant = 'primary',
//     asChild = false,
//     children,
//     ...buttonProps
//   } = props;
//   if (asChild && !(props.children instanceof Link)) {
//     throw 'asChild props needs a <Link /> as children';
//   }

//   const currentVariant = buttonVariants({ variant });
//   // aw.

//   const { $text, ...buttonVariantStyle } = useColorModeValue(
//     currentVariant.light,
//     currentVariant.dark
//   );
//   const textVariantStyle = $text;
//   // const buttonVariantStyle = useColorModeValue(
//   //   ButtonVariants.light[variant],
//   //   ButtonVariants.dark[variant]
//   // );
//   // const textVariantStyle = useColorModeValue(
//   //   TextVariants.light[variant],
//   //   TextVariants.dark[variant]
//   // );

//   const disabledStyleProps = useMemo(
//     () =>
//       props.disabled === true ? ButtonPresets.disabled : ButtonPresets.enabled,
//     [props.disabled]
//   );

//   const buttonPropStyles: ComponentProps<typeof ButtonBase> = {
//     ...buttonVariantStyle,
//     ...disabledStyleProps,
//   };

//   const _children = useMemo(() => {
//     if (React.Children.count(children) === 1 && children instanceof Link) {
//       return null;
//     }
//     if (React.Children.count(children) > 1) {
//       return React.Children.map(children, (child) => {
//         if (typeof child === 'string') {
//           return (
//             <ButtonText key={`button-text-${child}`} {...textVariantStyle}>
//               {child}
//             </ButtonText>
//           );
//         }
//         return child;
//       });
//     }
//     //
//     if (typeof children === 'string') {
//       return (
//         <ButtonText key={`button-text-${children}`} {...textVariantStyle}>
//           {children}
//         </ButtonText>
//       );
//     }
//     return children;
//   }, [children, textVariantStyle]);

//   if (asChild && children instanceof Link && _children === null) {
//     return React.cloneElement(
//       <>{children}</>,
//       {
//         ...buttonVariantStyle,
//         ...textVariantStyle,
//       },
//       null
//     );
//     // return <>{children}</>;
//   }

//   return (
//     <ButtonBase role="button" {...buttonPropStyles} {...buttonProps}>
//       {_children}
//     </ButtonBase>
//   );
// };

// interface ButtonTextProps extends ComponentProps<typeof ButtonTextBase> {
//   variant?: VariantType;
// }

// const ButtonTextComponent = ({ children, ...otherProps }: ButtonTextProps) => {
//   return <ButtonTextBase {...otherProps}>{children}</ButtonTextBase>;
// };

// const ButtonText = memo(ButtonTextComponent);

// export const Button = memo(ButtonComponent);
