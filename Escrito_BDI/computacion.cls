\NeedsTeXFormat{LaTeX2e}
\LoadClass[11pt, letterpaper]{article}
\pdfminorversion 4
\pagenumbering{gobble} 
\pagestyle{empty}

%Para no resaltar las ligas
\RequirePackage[hidelinks]{hyperref}
\RequirePackage{listings}

%FUENTES ***************************************//////////////////////
%\usepackage[sfdefault]{plex-sans} % Use IBM Plex Sans as the sans font and make it the default
%\usepackage{plex-serif} % Use IBM Plex Serif as the serif font
%\usepackage{plex-mono}

%Determinar el tamaño del papel y el margen
\RequirePackage[letterpaper, margin=1in]{geometry}

%Necesarias para usar tablas de varias páginas y líneas de separación
\RequirePackage{longtable}
\RequirePackage{booktabs}

\usepackage[dvipsnames]{xcolor}
%Necesario para incluir gráficas
\RequirePackage{graphicx} 
\RequirePackage{ragged2e}

%Para utilizar diagramas de Gantt
\RequirePackage{pgfgantt} 

%Para el resaltado en amarillo de las modificaciones
\RequirePackage{soul}
%\RequirePackage{soulutf8}

%Para colocar las notas al pie de página al final sin importar que quede espacio vacío
\RequirePackage[bottom]{footmisc}
\RequirePackage{etoolbox}
\RequirePackage{ifthen}

%Para el tipo tamaño de las letras en section y subsection
\RequirePackage{titlesec}
\titleformat*{\section}{\large\bfseries}
\titleformat*{\subsection}{\normalsize\bfseries}

%\usepackage{newpx}

%Para indicar que se usará Figura y Tabla en español, además, se coloca como separador un punto
\RequirePackage{caption}
\captionsetup{skip=5pt} 
\captionsetup{font={bf}}
\captionsetup[figure]{name={Figura },labelsep=period}
\captionsetup[table]{name={Tabla },labelsep=period}

%Utilizar el idioma español en la fecha
\RequirePackage[spanish]{babel}
\RequirePackage{enumitem}

\usepackage{booktabs}
\addtolength\aboverulesep{0.0ex}
\addtolength\belowrulesep{0.0ex}
\usepackage{longtable, array}

\RequirePackage[T1]{fontenc}
\graphicspath{{./Imagenes/}}
%\small UAM-Azcapotzalco
\RequirePackage{fancyhdr}
%\setitemize[0]{topsep=0pt,itemsep=0pt,parsep=0pt,partopsep=0pt,leftmargin=10pt}

\fancyhead{}
\fancyhead[L]{\footnotesize \fontfamily{qtm}\selectfont Reporte de Proyecto de Integración}
\fancyhead[R]{\footnotesize \fontfamily{qtm}\selectfont Ingeniería en Computación}
\fancyfoot{} % clear all footer fields
\fancyfoot[R]{\footnotesize\fontfamily{qtm}\selectfont \thepage}
\fancyfoot[L]{\footnotesize \fontfamily{qtm}\selectfont UAM-Azcapotzalco}
\fancyfoot[C]{}

\definecolor{codegreen}{rgb}{0,0.6,0}
\definecolor{codegray}{rgb}{0.5,0.5,0.5}
\definecolor{codepurple}{rgb}{0.58,0,0.82}
\definecolor{backcolour}{rgb}{0.95,0.95,0.92}

\lstdefinestyle{mystyle}{
	backgroundcolor=\color{backcolour},   
	commentstyle=\color{codegreen},
	keywordstyle=\color{magenta},
	numberstyle=\tiny\color{codegray},
	stringstyle=\color{codepurple},
	basicstyle=\ttfamily\footnotesize,
	breakatwhitespace=false,         
	breaklines=true,                 
	captionpos=b,                    
	keepspaces=true,                 
	numbers=left,                    
	numbersep=5pt,                  
	showspaces=false,                
	showstringspaces=false,
	showtabs=false,                  
	tabsize=2
}

\lstdefinestyle{mystyle2}
{
	language=[LaTeX]{TeX},
	texcsstyle=*\color{blue},
	basicstyle=\ttfamily,
	moretexcs={mycommand}, % user command highlight
	frame=single,
}

\lstset{style=mystyle2}

%Definición de variables
\def\titulo#1{\def\@titulo{#1}}
\def\reporte#1{\def\@reporte{#1}}
\def\trimestre#1{\def\@trimestre{#1}}
\def\tipo#1{\def\@tipo{#1}}

\def\matriculaa#1{\def\@matriculaa{#1}}
\def\alumnoa#1{\def\@alumnoa{#1}}
\def\rolaalumno#1{\def\@rolaalumno{#1}}
% Nuevas variables para el Alumno 2
\def\matriculab#1{\def\@matriculab{#1}}
\def\alumnob#1{\def\@alumnob{#1}}
\def\rolbalumno#1{\def\@rolbalumno{#1}}

\def\rola#1{\def\@rola{#1}}
\def\asesor#1{\def\@asesor{#1}}
\def\categoria#1{\def\@categoria{#1}}
\def\departamento#1{\def\@departamento{#1}}
\def\correo#1{\def\@correo{#1}}
\def\rolb#1{\def\@rolb{#1}}
\def\coasesor#1{\def\@coasesor{#1}}
\def\categoriacoasesor#1{\def\@categoriacoasesor{#1}}
\def\departamentocoasesor#1{\def\@departamentocoasesor{#1}}
\def\correocoasesor#1{\def\@correocoasesor{#1}}

\bibliographystyle{IEEEtran}

%REnombres de algunos comandos
\newcommand{\portada}{\maketitle}
\newcommand{\referencias}{\bibliography{./Referencias/piic.bib} }
\newcommand{\responsabilidad}{\resp}


\newcommand{\resp}{
	\ifthenelse{\equal{\@coasesor}{\empty}}
	%Este texto SÍ debe incluirse para que la propuesta pueda ser aceptada (con el ajuste mencionado en género y número de asesores).
	{El/La asesor(a) se responsabiliza de guiar al alumnado y de que todos los recursos mencionados en la Factibilidad Técnica estarán disponibles para el alumnado, de modo que el proyecto de integración se pueda concluir en tiempo y forma.\\[2.5cm]
	%Cerrar esta sección con una conclusión
	\begin{center}
		\begin{minipage}{0.5\textwidth}
			\centering
			\small\@asesor\\ %grado y nombre completo del asesor
			\textbf{\@rola}\\
		\end{minipage}
	\end{center}}
	{Los asesores se responsabilizan de guiar al alumnado y de que todos los recursos mencionados en la Factibilidad Técnica estarán disponibles para el alumnado, de modo que el proyecto de integración se pueda concluir en tiempo y forma.\\[2.5cm]
	%Cerrar esta sección con una conclusión
	\begin{center}
		\begin{minipage}{0.4\textwidth}
			\centering
			\small\@asesor\\ %grado y nombre completo del asesor
			\textbf{\@rola}\\
		\end{minipage}\hspace*{2cm}
	\begin{minipage}{0.4\textwidth}
		\centering
		\small\@coasesor\\ %grado y nombre completo del asesor
		\textbf{\@rolb}\\
	\end{minipage}
\end{center}}
}

%Formato para los profesores en la portada, ya sea que solo haya un asesor o dos
\newcommand{\asesores}[8]{\ifthenelse{\equal{#5}{\empty}}
	{
			%Si el parámetro 5 (\@coasesor) esta vacio, unicamente se imprime los datos del asesor
			\begin{minipage}{0.5\linewidth}
			\centering
			\textbf{\fontfamily{qtm}\selectfont{\@rola}}\\ %Rol del primer asesor
			#1\\%Grado y nombre del asesor
			#2\\%Categoría del asesor, e.g. Profesor Titular, Profesor Asociado
			#3\\%Departamento, e.g. Departamento de Sistemas
			\href{mailto:#4}{#4}%Correo del asesor
			\end{minipage}
	}
	{
		%Si el parámetro 5 (\@coasesor) NO esta vacio se imprimen los datos de los dos asesores
		\begin{minipage}{0.4\textwidth}
			\centering
			\textbf{\fontfamily{qtm}\selectfont{\@rola}}\\%Rol del primer asesor
			#1\\%Grado y nombre del asesor
			#2\\%Categoría del asesor, e.g. Profesor Titular, Profesor Asociado
			#3\\%Departamento, e.g. Departamento de Sistemas
			\href{mailto:#4}{#4}%Correo del asesor
		\end{minipage}\hspace*{2cm}
		\begin{minipage}{0.4\textwidth}
			\centering
			\textbf{\fontfamily{qtm}\selectfont{\@rolb}}\\
			#5\\%Grado y nombre del asesor
			#6\\%Categoría del asesor, e.g. Profesor Titular, Profesor Asociado
			#7\\%Departamento, e.g. Departamento de Sistemas
			\href{mailto:#8}{#8}%Correo del asesor
		\end{minipage}}\\[2.5cm] 
%
}

%Impresión de un solo asesor para la Declaratoria (ignora el segundo parámetro)
\newcommand{\asesorp}[1]{
    \begin{center}
        \begin{minipage}{0.45\linewidth}
            \centering
            \small #1\\%Grado y nombre del asesor
            \textbf{\@rola}\\
        \end{minipage}\\[1cm]
    \end{center}
}

\newcommand{\coasesorp}[1]{
    \begin{center}
        \begin{minipage}{0.45\linewidth}
            \centering
            \small #1\\%Grado y nombre del asesor
            \textbf{\@rolb}\\
        \end{minipage}\\[1cm]
    \end{center}
}

\newcommand{\alumnoap}[1]{
    \begin{center}
        \begin{minipage}{0.45\linewidth}
            \centering
            \small #1\\%Grado y nombre del asesor
            \textbf{\@rolaalumno}\\
        \end{minipage}\\[1 cm]
    \end{center}
}

\newcommand{\alumnobp}[1]{
    \begin{center}
        \begin{minipage}{0.45\linewidth}
            \centering
            \small #1\\%Grado y nombre del asesor
            \textbf{\@rolbalumno}\\
        \end{minipage}\\[1 cm]
    \end{center}
}


\newcommand{\declaratoria}[1]{
	\ifthenelse{\equal{#1}{Experiencia Profesional}}
	{\noindent \small Esta propuesta es solo para aprobar el Seminario de Integración en Ingeniería en Computación.}
	{ }%
}

\makeatletter         
\renewcommand\maketitle{
	{
		\begin{titlepage}
			\vspace*{\fill} %Centra el contenido de la página verticalmente
			\center % Centra todo el contenido de la página horizontalmente
			\fontfamily{bch}\selectfont
			%-------------------------------------------------------------------------------
			%	Encabezado de la portada
			%-------------------------------------------------------------------------------
			\includegraphics[width=\textwidth]{banner}
			\vspace{2cm}
		
			%-------------------------------------------------------------------------------
			%	Título
			%-------------------------------------------------------------------------------
			
			{\Large\textbf{\fontfamily{qtm}\selectfont{\@titulo}}}\\[0.5cm]
			%Modifica esta frase para que se ajuste al número de revisión que corresponda
			\@tipo\\[0.1cm]
			\@reporte\\[0.1cm]
			Trimestre \@trimestre \\[3cm] %Modifica el año y el período
			
			%-------------------------------------------------------------------------------
			%	Autor
			%-------------------------------------------------------------------------------
			\small
			\begin{minipage}{0.45\textwidth}
				\centering
				\textbf{\fontfamily{qtm}\selectfont{\@rolaalumno}}\\
				\@alumnoa\\ 
				\@matriculaa\\
				\href{mailto:al\@matriculaa @azc.uam.mx}{al\@matriculaa @azc.uam.mx}
			\end{minipage}\hspace*{1cm}
			\begin{minipage}{0.45\textwidth}
				\centering
				\textbf{\fontfamily{qtm}\selectfont{\@rolbalumno}}\\
				\@alumnob\\ 
				\@matriculab\\
				\href{mailto:al\@matriculab @azc.uam.mx}{al\@matriculab @azc.uam.mx}
			\end{minipage}\\[3.5cm]
            
			%-------------------------------------------------------------------------------
			%	Asesores
			%-------------------------------------------------------------------------------
			\asesores{\@asesor}{\@categoria}{\@departamento}{\@correo}{\@coasesor}{\@categoriacoasesor}{\@departamentocoasesor}{\@correocoasesor}
			
			%-------------------------------------------------------------------------------
			%	Fecha de entrega
			%-------------------------------------------------------------------------------
			
			\textspanish{\today}
			\normalsize
			
			\vfill %Rellena el espacio sobrante con espacios en blanco
			\vspace*{\fill}
	\end{titlepage}

\thispagestyle{empty}
\section*{\centering Declaratoria}
\noindent \justifying{Yo, Dra. Angeles Belém Priego Sánchez, declaro que aprobé el contenido del presente Reporte de Proyecto de Integración y doy mi autorización para su publicación en la Biblioteca Digital, así como en el Repositorio Institucional de UAM Azcapotzalco.}\\[1.5 cm]

\asesorp{\@asesor}

\noindent \justifying{Yo, Dr. Aron de la Cruz Vázquez, declaro que aprobé el contenido del presente Reporte de Proyecto de Integración y doy mi autorización para su publicación en la Biblioteca Digital, así como en el Repositorio Institucional de UAM Azcapotzalco.}\\[1.5 cm]

\coasesorp{\@coasesor}


\noindent \justifying{Yo, Cristian Emanuel Ceron Franco, doy mi autorización a la Coordinación de Servicios de Información de la Universidad Autónoma Metropolitana, Unidad Azcapotzalco, para publicar el presente documento en la Biblioteca Digital, así como en el Repositorio Institucional de UAM Azcapotzalco.}\\[1.5 cm]

\alumnoap{\@alumnoa}

\noindent \justifying{Yo, Ricardo Nava Lima, doy mi autorización a la Coordinación de Servicios de Información de la Universidad Autónoma Metropolitana, Unidad Azcapotzalco, para publicar el presente documento en la Biblioteca Digital, así como en el Repositorio Institucional de UAM Azcapotzalco.}\\[1.5 cm]

\alumnobp{\@alumnob}

%Coloca al final de la página el párrafo
\vfill
%Este párrafo es solo si van a presentar su propuesta en la modalidad de Experiencia profesional
\declaratoria{\@tipo}
%En caso contrario, eliminar este párrafo

\newpage


}} % Note the extra }
\makeatother
