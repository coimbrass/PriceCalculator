from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.popup import Popup
from kivy.uix.gridlayout import GridLayout
from kivy.uix.checkbox import CheckBox
import googlemaps
import re

# Inicializando o cliente da API Google Maps
API_KEY = 'AIzaSyAf2vMpz8WqBZVrmu4Gx3kArpnQvtlo7bo'
gmaps = googlemaps.Client(key=API_KEY)

class DistanceApp(App):
    def build(self):
        main_layout = BoxLayout(orientation='vertical')

        # Settings button (icon-based)
        menu_layout = BoxLayout(size_hint_y=0.1)
        settings_button = Button(text='Settings', size_hint_x=0.2)
        settings_button.bind(on_press=self.open_menu_popup)
        menu_layout.add_widget(settings_button)
        main_layout.add_widget(menu_layout)

        # Travel input fields
        travel_layout = GridLayout(cols=2, size_hint_y=0.2)
        self.start_input = TextInput(hint_text='Start Travel')
        self.end_input = TextInput(hint_text='End Travel')
        travel_layout.add_widget(self.start_input)
        travel_layout.add_widget(self.end_input)
        main_layout.add_widget(travel_layout)

        # Input for number of hours playing
        play_hours_layout = BoxLayout(orientation='horizontal', size_hint_y=0.1)
        self.play_hours_label = Label(text="Hours of Playing: 0", size_hint_x=0.6, font_size=24)
        play_hours_layout.add_widget(self.play_hours_label)

        # Buttons to increase and decrease play hours
        self.up_button = Button(text="+", size_hint_x=0.2)
        self.up_button.bind(on_press=self.increase_hours)
        play_hours_layout.add_widget(self.up_button)

        self.down_button = Button(text="-", size_hint_x=0.2)
        self.down_button.bind(on_press=self.decrease_hours)
        play_hours_layout.add_widget(self.down_button)
        main_layout.add_widget(play_hours_layout)

        # Calculate button
        self.calculate_button = Button(text='CALCULATE', size_hint_y=0.2)
        self.calculate_button.bind(on_press=self.calculate_price)
        main_layout.add_widget(self.calculate_button)

        # Price label (with binding to open popup)
        self.result_label = Label(text='Price', font_size=40, size_hint_y=0.3)
        self.result_label.bind(on_touch_down=self.open_details_popup)
        main_layout.add_widget(self.result_label)

        # Default variables
        self.price_per_km = 0.38
        self.pay_travel_hour = 10
        self.musicians = 8
        self.play_hours = 0
        self.pay_work_hour = 100
        self.avoid_tolls = False
        self.avoid_highways = False

        return main_layout

    def increase_hours(self, instance):
        self.play_hours += 0.5
        self.play_hours_label.text = f"Hours of Playing: {self.play_hours}"

    def decrease_hours(self, instance):
        if self.play_hours > 0:  # Prevent negative values
            self.play_hours -= 0.5
        self.play_hours_label.text = f"Hours of Playing: {self.play_hours}"

    def open_menu_popup(self, instance):
        # Enlarged Popup for settings
        popup_layout = GridLayout(cols=2, padding=20, spacing=20)

        # Input fields
        popup_layout.add_widget(Label(text='Price per KM:'))
        self.price_input = TextInput(text=str(self.price_per_km))
        popup_layout.add_widget(self.price_input)

        popup_layout.add_widget(Label(text='Pay per Travel Hour:'))
        self.travel_hour_input = TextInput(text=str(self.pay_travel_hour))
        popup_layout.add_widget(self.travel_hour_input)

        popup_layout.add_widget(Label(text='Pay per Working Hour:'))
        self.work_hour_input = TextInput(text=str(self.pay_work_hour))
        popup_layout.add_widget(self.work_hour_input)

        popup_layout.add_widget(Label(text='Number of Musicians:'))
        self.musicians_input = TextInput(text=str(self.musicians))
        popup_layout.add_widget(self.musicians_input)

        # Add checkboxes for tolls and highways
        popup_layout.add_widget(Label(text="Avoid Tolls:"))
        self.avoid_tolls_checkbox = CheckBox(active=self.avoid_tolls)
        popup_layout.add_widget(self.avoid_tolls_checkbox)

        popup_layout.add_widget(Label(text="Avoid Highways:"))
        self.avoid_highways_checkbox = CheckBox(active=self.avoid_highways)
        popup_layout.add_widget(self.avoid_highways_checkbox)

        # Save button
        save_button = Button(text='Save', size_hint_y=0.2)
        save_button.bind(on_press=lambda x: self.save_settings(popup))
        popup_layout.add_widget(save_button)

        popup = Popup(title='Settings', content=popup_layout, size_hint=(0.8, 0.8))
        popup.open()

    def save_settings(self, popup):
        # Save the values from the popup
        self.price_per_km = float(self.price_input.text)
        self.pay_travel_hour = float(self.travel_hour_input.text)
        self.pay_work_hour = float(self.work_hour_input.text)
        self.musicians = int(self.musicians_input.text)

        # Save the checkbox states
        self.avoid_tolls = self.avoid_tolls_checkbox.active
        self.avoid_highways = self.avoid_highways_checkbox.active

        popup.dismiss()  # Close the popup using the correct reference


    def calculate_price(self, instance):
        origin = self.start_input.text
        destination = self.end_input.text

        if origin and destination:
            mode = "driving"

            # Verificar quais restrições evitar
            avoid = []
            if self.avoid_tolls_checkbox.active:
                avoid.append("tolls")
            if self.avoid_highways_checkbox.active:
                avoid.append("highways")

            # Montar o dicionário de parâmetros da API
            request_params = {
                'origins': [origin],
                'destinations': [destination],
                'mode': mode
            }

            # Só adicionar 'avoid' se houver algo para evitar
            if avoid:
                request_params['avoid'] = ",".join(avoid)

            try:
                # Consultando a API do Google Maps
                result = gmaps.distance_matrix(**request_params)

                if result['rows']:
                    distance_text = result['rows'][0]['elements'][0]['distance']['text']
                    duration_text = result['rows'][0]['elements'][0]['duration']['text']

                    # Extraindo o valor numérico da distância em quilômetros
                    distance_km = re.findall(r'\d+\.?\d*', distance_text)[0]
                    distance_km = float(distance_km)

                    # Calculando o custo com base na distância (ida e volta 2 carros)
                    cost_distance = distance_km * self.price_per_km * 2 * 2

                    # Extraindo o tempo de viagem e convertendo para horas
                    time_parts = duration_text.split(' ')
                    hours = 0
                    minutes = 0

                    if "hour" in time_parts:
                        hour_index = time_parts.index("hour")
                        hours = float(time_parts[hour_index - 1])

                    if "min" in time_parts:
                        minute_index = time_parts.index("min")
                        minutes = float(time_parts[minute_index - 1])

                    total_travel_hours = hours + (minutes / 60)

                    # Calculando o custo com base no tempo de viagem (ida e volta)
                    cost_time_travel = total_travel_hours * self.pay_travel_hour * self.musicians * 2

                    # Calculando o custo com base no tempo de trabalho
                    cost_work = self.play_hours * self.pay_work_hour * self.musicians

                    # Cálculo final (soma do custo por distância e tempo)
                    self.total_cost = cost_distance + cost_time_travel + cost_work

                    # Save cost details for the popup
                    self.cost_details = {
                        "distancia": distance_text,
                        "duração": duration_text,
                        "preço do gasóleo": str(round(cost_distance, 2)) + "€",
                        "preço do tempo em viagem": str(round(cost_time_travel, 2)) + " €",
                        "preço de tocar": str(cost_work) + " €",
                        "dinheiro por carro": str(round(cost_distance / 2, 2)) + " €",
                        "dinheiro por músico": str((cost_time_travel + cost_work) / self.musicians) + " €"
                    }

                    # Atualizando a label com o custo total e a duração
                    self.result_label.text = (f"{self.total_cost:.2f} euros")
                else:
                    self.result_label.text = "Localizações inválidas!"
            except Exception as e:
                self.result_label.text = f"Erro: {str(e)}"
        else:
            self.result_label.text = "Por favor, insira a origem e o destino."


    def open_details_popup(self, instance, touch):
        if instance.collide_point(*touch.pos) and hasattr(self, 'cost_details'):
            popup_layout = BoxLayout(orientation='vertical', padding=10, spacing=10)

            for key, value in self.cost_details.items():
                popup_layout.add_widget(Label(text=f"{key.capitalize()}: {value}"))

            close_button = Button(text='Close', size_hint_y=0.2)
            popup_layout.add_widget(close_button)

            popup = Popup(title="Details Breakdown", content=popup_layout, size_hint=(0.8, 0.8))
            close_button.bind(on_press=popup.dismiss)
            popup.open()

if __name__ == '__main__':
    DistanceApp().run()
