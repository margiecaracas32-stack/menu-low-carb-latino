import Link from "next/link";

const content: Record<string, { title: string; intro: string; sections: [string,string][] }> = {
  privacidad:{title:"Política de privacidad",intro:"Versión informativa previa a revisión legal y publicación.",sections:[["Datos que usamos","Correo, preferencias alimentarias, tamaño del hogar y uso del producto, solo cuando sean necesarios."],["Para qué los usamos","Para crear el menú, guardar cambios, prestar soporte y mejorar la experiencia."],["Tus derechos","Podrás solicitar acceso, corrección o eliminación escribiendo al correo de soporte."]]},
  terminos:{title:"Términos de servicio",intro:"Condiciones preliminares del servicio Menú Low Carb Latino.",sections:[["Servicio","La app ofrece organización alimentaria y recetas informativas; no presta atención médica."],["Cuenta y suscripción","El precio, la renovación y la cancelación se mostrarán antes de iniciar la prueba."],["Uso responsable","El usuario debe revisar ingredientes, alergias y recomendaciones profesionales aplicables."]]},
  reembolso:{title:"Política de reembolso",intro:"Esta política se alineará con la configuración final de Hotmart antes de vender.",sections:[["Prueba","La fecha y el monto del primer cobro serán visibles antes de comenzar."],["Cancelación","Cancelar antes del fin de la prueba evita el siguiente cobro, según las condiciones mostradas."],["Reembolso","Las solicitudes se tramitarán conforme al plazo y procedimiento publicados en el checkout."]]},
  disclaimer:{title:"Aviso alimentario",intro:"Menú Low Carb Latino organiza información; no sustituye atención profesional.",sections:[["Sin consejo médico","La app no diagnostica, trata ni garantiza pérdida de peso o control de glucosa."],["Alergias y restricciones","Revisa siempre ingredientes, etiquetas y posibles contaminaciones cruzadas."],["Decisiones personales","Consulta a un profesional ante embarazo, enfermedad, medicación o necesidades clínicas."]]},
};

export function LegalContent({kind}:{kind:keyof typeof content}){
  const page=content[kind];
  return <main className="legal-page"><Link href="/">← Volver a Menú Low Carb Latino</Link><p className="kicker">INFORMACIÓN LEGAL</p><h1>{page.title}</h1><p className="legal-intro">{page.intro}</p>{page.sections.map(([title,text])=><section key={title}><h2>{title}</h2><p>{text}</p></section>)}<p className="legal-contact">Contacto provisional: soporte@menulowcarblatino.com</p></main>
}
