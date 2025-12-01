import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, contactType, contactInfo, countryCode, phoneNumber, message } = body

    // Validar datos requeridos
    if (!name || !message) {
      return NextResponse.json(
        { error: 'Nombre y mensaje son requeridos' },
        { status: 400 }
      )
    }

    // Preparar información de contacto según el tipo
    let contactMethod = ''
    let contactDetails = ''
    
    if (contactType === 'whatsapp') {
      contactMethod = 'WhatsApp'
      contactDetails = `+${countryCode || ''}${phoneNumber || ''}`
    } else {
      contactMethod = 'Correo Electrónico'
      contactDetails = contactInfo || ''
    }

    // Crear contenido del mensaje
    const timestamp = new Date().toLocaleString('es-ES', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'America/Caracas'
    })

    const messageContent = `
========================================
NUEVO MENSAJE DE CONTACTO
========================================
Fecha y Hora: ${timestamp}
Método de Contacto: ${contactMethod}
Información de Contacto: ${contactDetails}
Nombre: ${name}
Mensaje:
${message}
========================================
`

    // Guardar en archivo de texto
    const messagesDir = path.join(process.cwd(), 'mensajes-contacto')
    if (!fs.existsSync(messagesDir)) {
      fs.mkdirSync(messagesDir, { recursive: true })
    }

    const fileName = `mensaje-${Date.now()}.txt`
    const filePath = path.join(messagesDir, fileName)
    fs.writeFileSync(filePath, messageContent, 'utf-8')

    // ============================================================
    // CONFIGURACIÓN DE NODEMAILER - IMPORTANTE
    // ============================================================
    // 
    // ⚠️ NOTA IMPORTANTE: Debes crear un correo electrónico ESPECÍFICO
    //    solo para automatizar el envío de correos desde tu portafolio.
    // 
    // ¿Por qué un correo separado?
    // - Es más seguro (no expones tu correo personal)
    // - Puedes usar una App Password sin afectar tu cuenta principal
    // - Si hay problemas, solo afecta a ese correo de automatización
    // 
    // OPCIONES RECOMENDADAS:
    // 
    // 1. GMAIL (Más fácil):
    //    - Crea un Gmail nuevo (ej: tuportafolio@gmail.com)
    //    - Ve a: https://myaccount.google.com/apppasswords
    //    - Genera una "App Password" para ese correo
    //    - Usa ese correo y App Password en las variables de entorno
    // 
    // 2. SERVICIOS ESPECIALIZADOS (Más profesional):
    //    - SendGrid (gratis hasta 100 emails/día)
    //    - Mailgun (gratis hasta 5,000 emails/mes)
    //    - Amazon SES (muy económico)
    // 
    // 3. PROTONMAIL:
    //    - No permite SMTP directo
    //    - Necesitas ProtonMail Bridge (solo funciona localmente)
    //    - Mejor usar un servicio SMTP alternativo
    // 
    // CONFIGURACIÓN EN .env:
    // SMTP_HOST=smtp.gmail.com
    // SMTP_PORT=587
    // SMTP_USER=tu-correo-automatizacion@gmail.com  ← Correo dedicado para esto
    // SMTP_PASSWORD=tu-app-password-aqui
    // 
    // ============================================================
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('Las variables de entorno SMTP_USER y SMTP_PASSWORD deben estar configuradas. Crea un correo dedicado solo para automatizar el envío de correos.')
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // Preparar el email
    const emailSubject = `Nuevo contacto desde tu portafolio - ${contactMethod}`
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
          Nuevo Mensaje de Contacto
        </h2>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Fecha y Hora:</strong> ${timestamp}</p>
          <p><strong>Método de Contacto:</strong> ${contactMethod}</p>
          <p><strong>Información de Contacto:</strong> ${contactDetails}</p>
          <p><strong>Nombre:</strong> ${name}</p>
        </div>
        <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Mensaje:</h3>
          <p style="color: #666; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Este mensaje fue enviado desde el formulario de contacto de tu portafolio.
        </p>
      </div>
    `

    const emailText = messageContent

    // Enviar email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: 'SDMM.777@proton.me', // Tu email de destino
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Mensaje enviado correctamente',
        savedToFile: fileName
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error al procesar el mensaje:', error)
    return NextResponse.json(
      { 
        error: 'Error al procesar el mensaje',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

